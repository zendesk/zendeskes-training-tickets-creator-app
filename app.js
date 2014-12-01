(function() {

  var csvParser = require('csv.js');
  csvParser.RELAXED = true;

  return {
    //global vars
    parsedCSV: null,
    subject: null,
    description: null,
    requesterEmail: null,
    requesterName: null,
    productArea: null,

    events: {
      'click .creator': 'getCSVFile',
      'getCSV.fail': 'errorMessage',
      'getCSV.done': 'parseCSV',
    }, //end of events

    getCSVFile: function() {
      this.requesterName = this.$(".name").val(); //setting requester name from input field
      this.requesterEmail = this.$(".email").val(); //setting requester email from input field
      this.productArea = this.$("#productArea option:selected").val(); //setting product area from dropdown

      /*Checking if requesterName and requester Email was set*/
      if (this.requesterName.length === 0 || this.requesterEmail.length === 0) {
        services.notify('Requester Name or Email Cannot Be Blank', 'alert');
        return;
      }

      this.ajax('getCSV', this.productArea); //getting CSV file
    }, //end of getCSVFile

    errorMessage: function() {
      services.notify("Unable to retrieve file!", 'error');
    }, //end of errorMessage

    parseCSV: function(data) {
      this.parsedCSV = csvParser.parse(data); //parseCSV and set parsedCSV var
      this.makeTickets(); //createTickets
    }, //end of parseCSV


    makeTickets: function() {

      var that = this;
      _.each(this.parsedCSV, function(each) { //iterate over parsedCSV
        that.subject = each[0]; //setting subject
        that.description = each[1]; //setting description
        that.ajax('importTicket', that.subject, that.description, that.requesterName, that.requesterEmail); //making request to import ticket
      });
      services.notify('Done Creating Tickets!', 'notice');
    }, //end of makeTickets

    requests: {

      getCSV: function(fileName) {
        return {
          url: 'https://zendesk.box.com/shared/static/' + fileName + '.csv',
          type: 'GET',
          cors: true
        };
      }, //end of getCSV

      importTicket: function(subject, description, requesterName, requesterEmail) {
          return {
            url: '/api/v2/imports/tickets.json',
            type: 'POST',
            contentType: 'application/json', //data:json doesn't work O.o
            data: JSON.stringify({
              "ticket": {
                "requester": {
                  "name": requesterName,
                  "email": requesterEmail
                },
                "subject": subject,
                "comment": {
                  "body": description
                }
              }
            })
          };
        } //end of importTicket
    } //end of requests

  };

}());