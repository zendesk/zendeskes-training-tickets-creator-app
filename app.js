(function() {

  var csvParser = require('csv.js');
  csvParser.RELAXED = true;

  return {
    parsedCSV: null,
    subject: null,
    description: null,
    email: 'test@test.com.nz',
    events: {
      // 'getCSV.done':pa
      'click.creator': 'getCSVFile',
      'getCSV.done': 'parseCSV',
    }, //end of events

    getCSVFile: function() {
      this.ajax('getCSV');
    },

    parseCSV: function(data) {
      console.log("About to parse CSV");
      // console.log('CSV DATA' + '\n' + data);
      this.parsedCSV = csvParser.parse(data);
      // console.log(this.parsedCSV);
      this.makeTickets();
    },


    makeTickets: function() {
      console.log("LET'S Fill It With Tickets!!");
      // console.log('Parsed CSV' +this.parsedCSV);
      console.log(encodeURI('test@test.com.nz'));

      this.ajax('createTicket', 'Test Ticket', 'Test Description');

      var that = this;
      _.each(this.parsedCSV, function(each) {
        console.log("EACH");
        that.subject = each[0];
        that.description = each[1];
        console.log(that.subject);
        console.log(that.description);
      console.log('Test');
      that.ajax('createTicket',subject, description);
      });
    },

    testFunction: function() {
      console.log("testFunction");
    },

    requests: {

      getCSV: function() {
        return {
          //https://dl.dropboxusercontent.com/u/23462139/training1.csv
          url: 'https://dl.dropboxusercontent.com/u/23462139/training1.csv',
          type: 'GET',
          cors: true
        };
      },

      createTicket: function(subject, description) {
        return {
          //'/requests/embedded/create.json?subject=' + this.newSub + '&description='+ this.newDesc + '&name=' + this.newRequester  + '&email='+ encodeURI(this.newEmail) + '',
          // url: '/requests/embedded/create.json?subject=' + this.subject + '&description='+ this.description + '&name=Training App'  + '&email='+ encodeURI(this.email),

          //WORKING:
          /*
          https://pchhetri.zendesk.com/requests/embedded/create.json?subject=TestTicket&description=TestTicket&name=TrainingApp&email=test@test.com.nz
          */


          url: '/requests/embedded/create.json?subject=TestTicket&description=TestTicket&name=TrainingJIRAApp&email=' + encodeURI(this.email) + '',
          dataType: 'JSON'
        };
      }
    } //end of requests

  };

}());