
var Smile = (function() {

    // PRIVATE VARIABLES
        
    // The backend we'll use for Part 2. For Part 3, you'll replace this 
    // with your backend.
    var apiUrl = 'https://kh-smiles.herokuapp.com'; 
    // FINISH ME (Task 4): You can use the default smile space, but this means
    //            that your new smiles will be merged with everybody else's
    //            which can get confusing. Change this to a name that 
    //            is unlikely to be used by others. 
    var smileSpace = 'nowifizone'; // The smile spsace to use. 


    var smiles; // smiles container, value set in the "start" method below
    var smileTemplateHtml; // a template for creating smiles. Read from index.html
                           // in the "start" method
    var create; // create form, value set in the "start" method below


    // PRIVATE METHODS
      
   /**
    * HTTP GET request 
    * @param  {string}   url       URL path, e.g. "/api/smiles"
    * @param  {function} onSuccess   callback method to execute upon request success (200 status)
    * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
    * @return {None}
    */
   var makeGetRequest = function(url, onSuccess, onFailure) {
       $.ajax({
           type: 'GET',
           url: apiUrl + url,
           dataType: "json",
           success: onSuccess,
           error: onFailure
       });
   };

    /**
     * HTTP POST request
     * @param  {string}   url       URL path, e.g. "/api/smiles"
     * @param  {Object}   data      JSON data to send in request body
     * @param  {function} onSuccess   callback method to execute upon request success (200 status)
     * @param  {function} onFailure   callback method to execute upon request failure (non-200 status)
     * @return {None}
     */
    // Sending JSON data
    var makePostRequest = function(url, data, onSuccess, onFailure) {
        $.ajax({
            type: 'POST',
            url: apiUrl + url,
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",



            success: onSuccess,
            error: onFailure
        });
    };
     
    /**
     * Insert smile into smiles container in UI
     * @param  {Object}  smile       smile JSON
     * @param  {boolean} beginning   if true, insert smile at the beginning of the list of smiles
     * @return {None}
     */


    var insertSmile = function(smile, beginning) {
        // Start with the template, make a new DOM element using jQuery
        var newElem = $(smileTemplateHtml);
       //  var monthNames = ["January", "February", "March", "April", "May", "June",
  //"July", "August", "September", "October", "November", "December"];  
        // Populate the data in the new element
        // Set the "id" attribute 
        newElem.attr('id', smile.id); 
        // Now fill in the data that we retrieved from the server
        newElem.find('.title').text(smile.title);
        newElem.find('.story').text(smile.story);
        newElem.find('.happiness-level-1').removeClass('happiness-level-1').addClass('happiness-level-' + smile.happiness_level);
        newElem.find('.count').text(smile.like_count);
        //newElem.attr('created_at', smile.created_at);
        var myDate = new Date(smile.created_at);
       // var plainDate = new Date(smile.created_at);
   //  var allDate = plainDate.getHours()+":"+plainDate.getMinutes() + " " + monthNames[plainDate.getMonth()] + " "+plainDate.getDay()+ "," +plainDate.getFullYear();
        newElem.find('.timestamp').text(myDate);

        // FINISH ME (Task 2): fill-in the rest of the data
        if (beginning) {
            smiles.prepend(newElem);
        } else {
            smiles.append(newElem);
        }
    };


     /**
     * Get recent smiles from API and display 10 most recent smiles
     * @return {None}
     */
    var displaySmiles = function() {
        // Prepare the AJAX handlers for success and failure
        var onSuccess = function(data) { // Data is the JSON object returned from the GEt req
            /* FINISH ME (Task 2): display smiles with most recent smiles at the beginning */
           
            for (var i = 0;  data.smiles[i] != null; i ++)
            {
                insertSmile(data.smiles[i], false);
            }
            
     };
        var onFailure = function() { 
            console.error('display smiles failed'); 
        };
        /* FINISH ME (Task 2): make a GET request to get recent smiles */
        makeGetRequest("/api/smiles?space=nowifizone&count=10&order_by=created_at",onSuccess, onFailure );

    };

    /**
     * Add event handlers for clicking like.
     * @return {None}
     */
    var attachLikeHandler = function(e) {
        // Attach this handler to the 'click' action for elements with class 'like'
        smiles.on('click', '.like', function(e) {
            // FINISH ME (Task 3): get the id of the smile clicked on to use in the POST request
            var smileId = e.target;
            smileId = $(smileId).parents().eq(2).attr('id'); // smileId = ID
            
                       // Prepare the AJAX handlers for success and failure
            var onSuccess = function(data) {
                /* FINISH ME (Task 3): update the like count in the UI */
                // Update like count
              
                var count =  $('#' +smileId).find('.count');
                count= parseInt($(count).html()); // ensures the count obj will be read as an int 
                count = count + 1; 
                
                $('#' +smileId).find('.count').text(count);  // Display new like count
            };
            var onFailure = function() { 
                console.error('like smile error'); 
            };
            /* FINISH ME (Task 3): make a POST request to like this smile */
            var url = "/api/smiles/" + smileId + "/like";
          //  makePostRequest("/api/smiles/40/like",smileId,onSuccess,onFailure);
          makePostRequest(url,smileId,onSuccess,onFailure);
        });
    };


    /**
     * Add event handlers for submitting the create form.
     * @return {None}
     */
    var attachCreateHandler = function(e) {
        // First, hide the form, initially 
      //  create.find('form').show(); 
        create.find('.testing').hide(); // hide share a smile link 
        smiles.hide(); // hide all posts 
        // FINISH ME (Task 4): add a handler to the 'Share a smile...' button to
        //                     show the 'form' and hide to button
        create.on('click', '.testing', function(e)
        {
            e.preventDefault();
            create.find('form').show();
            create.find('.testing').hide();
            smiles.hide();
        });
        // FINISH ME (Task 4): add a handler for the 'Cancel' button to hide the form
        // and show the 'Shared a smile...' button
        create.on('click','.cancel', function(e){
                e.preventDefault();
                smiles.show();
                create.find('form').hide(); // close form without saving
                create.find('.testing').show(); // show share a smile link
            });
        // The handler for the Post button in the form
        create.on('click', '.submit-input', function (e){
            e.preventDefault (); // Tell the browser to skip its default click action

            var smile = {}; // Prepare the smile object to send to the server
            smile.title = create.find('.title-input').val();
            var errors;
            if (smile.title.length > 64 || smile.title.length == 0)
            {
          
             errors = 'Title is too long or empty \n'; 
              
            }
            // FINISH ME (Task 4): collect the rest of the data for the smile
            smile.space = 'nowifizone';
            smile.story = create.find('.story-input').val();
            var today = Date.now();
            smile.created_at = today;
            if (smile.story.length > 2048 || smile.story.length == 0)
            {               
               errors = errors + 'Story is too long or empty \n';
            }
            smile.happiness_level = create.find('.happiness-level-input').val();
           if (smile.happiness_level < 1 || smile.happiness_level > 3 )
            {
                errors = errors + 'Invalid happiness level \n'; 
            }
            smile.like_count = 0;
            //smile.id =1; 
         //  smile.id = Math.floor(Math.random() * 11) + Date.now();
            

            var onSuccess = function(data) {
                // FINISH ME (Task 4): insert smile at the beginning of the smiles container
                  insertSmile(data.smile, true);
            };
            var onFailure = function() { 
                errors = errors +'Create smile failed';
                 alert(errors);
            };
            
         
            // FINISH ME (Task 4): make a POST request to create the smile, then 
            //            hide the form and show the 'Shared a smile...' button
           var url = "/api/smiles?space=nowifizone&" + smile.title + '&' + smile.story + '&' + smile.happiness_level + '&' +smile.like_count;
           ///api/smiles?space=initial&count=10&order_by=created_at
            makePostRequest(url,smile,onSuccess,onFailure);
            create.find('form').hide();
            create.find('.testing').show();
            smiles.show();
        });

    };

    
    /**
     * Start the app by displaying the most recent smiles and attaching event handlers.
     * @return {None}
     */
    var start = function() {
        smiles = $(".smiles");
        create = $(".create");

        // Grab the first smile, to use as a template
        smileTemplateHtml = $(".smiles .smile")[0].outerHTML;
        // Delete everything from .smiles
        smiles.html('');

        displaySmiles();
        attachLikeHandler();
        attachCreateHandler();
    };
    

    // PUBLIC METHODS
    // any private methods returned in the hash are accessible via Smile.key_name, e.g. Smile.start()
    return {
        start: start
    };
    
})();
