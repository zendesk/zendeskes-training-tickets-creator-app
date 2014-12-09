(function() {

  var csvParser = require('csv.js');
  csvParser.RELAXED = true;

  return {
    /*global vars*/
    parsedCSV: null,
    subject: null,
    description: null,
    requesterEmail: null,
    requesterName: null,
    productArea: null,
    requesterID: null,
    errorTicketCreate: null,

    events: {
      'click .creator': 'getCSVFile',
      'getCSV.fail': 'errorGettingCSV',
      'getCSV.done': 'parseCSV',
      'searchRequester.done': 'makeRequester'
    }, //end of events

    getCSVFile: function() {
      this.requesterName = this.$(".name").val(); //setting requester name from input field
      this.requesterEmail = this.$(".email").val(); //setting requester email from input field
      this.productArea = this.$("#productArea option:selected").val(); //setting product area from dropdown

      /*Checking if requesterName and requesterEmail was set*/
      if (this.requesterName.length === 0) {
        services.notify('Trainer Name is Required!', 'alert', 8000);
        return;
      } else if (this.requesterEmail.length === 0) {
        services.notify('Trainer Email is Required!', 'alert', 8000);
        return;
      }

      this.ajax('getCSV', this.productArea); //getting CSV file
    }, //end of getCSVFile

    errorGettingCSV: function() {
      services.notify("Unable to retrieve file!", 'error');
    }, //end of errorGettingCSV

    parseCSV: function(data) {
      this.parsedCSV = csvParser.parse(data); //parse CSV file and set parsedCSV var
      this.ajax('searchRequester', this.requesterEmail); // search if specified requester exits
    }, //end of parseCSV

    makeRequester: function(data) {
      if (data.count !== 0) { // if there was a result from the search
        this.requesterID = data.results[0].id; // set requesterID to by grabbing userID from search result
        this.makeTickets(); // call on function to create tickets
      } else { // if the requester doesn't exist already, create the requester as a new user to avoid 409 errors using the ticket import API
        this.ajax('createRequester', this.requesterName, this.requesterEmail) // creating the requester as a new user
          .done(function(jqXHR) {
            this.requesterID = jqXHR.user.id; // grabbing the userID of the requester that was created and setting global var
            this.makeTickets(); // call on fucntion to create tickets
          })
          .fail(function(jqXHR) {
            /*Upon failure construct an error message with response code and text*/
            console.log('Error creating user:\n' + jqXHR.status + ' ' + jqXHR.responseText);
            services.notify('Error creating user!', 'error', 8000); // fail error message
          });
      }
    }, //end of makeRequester

    makeTickets: function() {
      var that = this; // aliasing this to another var to use inside _.each function
      _.each(this.parsedCSV, function(each) { //iterate over parsedCSV
        that.subject = each[0]; //setting subject
        that.description = each[1]; //setting description
        that.ajax('importTicket', that.subject, that.description, that.requesterID) // call to create tickets
          .done(function(data) {
            console.log('Created a Ticket'); // console logging upon success for debugging
          })
          .fail(function(jqXHR) {
            console.log('Ticket Creation failed\n' + jqXHR.status + ' ' + jqXHR.responseText); // console logging error for easy debugging
            that.errorTicketCreate = true;
          }); // end of ajax call to create tickets
      }); // end of _.each to iterate over parsedCSV
      /*Messages upon successful or unsuccessful ticket creation*/
      if (this.errorTicketCreate === null) {
        services.notify('Successfully Created Tickets! :)', 'notice', 8000); // notify success message
      } else if (this.errorTicketCreate === true) {
        services.notify('Error in Creating tickets :(', 'error', 8000); // notify error message
      }
    }, //end of makeTickets

    requests: {

      getCSV: function(fileName) {
        return {
          // url: 'https://dl.dropboxusercontent.com/u/23462139/T2%20Training/jira.csv',
          // url: 'https://zendesk.box.com/shared/static/z64uov171lbyflhr7f0h.csv',
          url: '/proxy/direct?url=https://zendesk.box.com/shared/static/' + fileName + '.csv',
          type: 'GET',
          cors: true,
          dataType: 'text',
        };
      }, //end of getCSV

      searchRequester: function(email) {
        return {
          url: '/api/v2/search?query=type%3Auser%20email%3A' + encodeURI(email),
          type: 'GET'
        };
      },

      createRequester: function(name, email) {
        return {
          url: '/api/v2/users.json',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            'user': {
              'name': name,
              'email': email
            }
          })
        };

      }, //end of createRequester

      importTicket: function(subject, description, requester_id) {
          return {
            url: '/api/v2/imports/tickets.json',
            type: 'POST',
            contentType: 'application/json', //data:json doesn't work O.o
            data: JSON.stringify({
              "ticket": {
                "requester_id": requester_id,
                "tags": [ "zendesk_training", "zendesk_training_t2" ],
                "subject": subject,
                "comment": {
                  "body": description
                }
              }
            })
          };
        } //end of importTicket
    } //end of requests

  }; //end of return

}());