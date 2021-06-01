// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        comment_rows: [], // Contains all the comments
        reply_rows: [], // Contains all the replies
        user_email: "",
        name: "",
        add_comment_mode: false,
        comment_content: "",
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    // Adds a user's comment to the database.
    app.add_comment = function () {
        axios.post(add_comment_url,
            {
                comment_content: app.vue.comment_content,
                name: app.vue.name,
            }).then(function (response) {
            app.vue.comment_rows.push({
                id: response.data.id,
                comment_content: app.vue.comment_content,
                user_email: app.vue.user_email,
                name: app.vue.name,
                temp_comment_content: app.vue.comment_content,
                liked: false,
                disliked: false,
                count: 0,
                edit_mode: false,
                reply_content: "",
                reply_mode: false,
                show_replies: false,
                num_replies: 0,
            });
            app.enumerate(app.vue.comment_rows);
            app.set_add_comment_mode(false);
            app.reset_comment_form();
        });
    };

    // Adds a user's reply to a comment, to the database.
    app.add_reply = function (row_idx) {
        let comment_id = app.vue.comment_rows[row_idx].id;
        axios.post(add_reply_url, {
            comment_id: comment_id,
            reply_content: app.vue.comment_rows[row_idx].reply_content,
            name: app.vue.name,
        }).then(function (response) {
            app.vue.reply_rows.push({
                id: response.data.id,
                comment_id: comment_id,
                reply_content: app.vue.comment_rows[row_idx].reply_content,
                user_email: app.vue.user_email,
                name: app.vue.name,
                temp_reply_content: app.vue.comment_rows[row_idx].reply_content,
                edit_mode: false,
            });
            app.enumerate(app.vue.reply_rows);
            app.set_reply_mode(row_idx, false);
            app.reset_reply_form(row_idx);
            for (let i = 0; i < app.vue.comment_rows.length; i += 1) {
                if (app.vue.comment_rows[i].id == comment_id) {
                    app.vue.comment_rows[i].num_replies += 1;
                    break;
                }
            }
        });
    }

   // Deletes a user's comment from the database.
    app.delete_comment = function(row_idx) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(delete_comment_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.comment_rows.length; i++) {
                if (app.vue.comment_rows[i].id === id) {
                    app.vue.comment_rows.splice(i, 1);
                    app.enumerate(app.vue.comment_rows);
                    break;
                }
            }
        });
    };

    // Deletes a user's reply from the database.
    app.delete_reply = function(row_idx) {
        let id = app.vue.reply_rows[row_idx].id;
        axios.get(delete_reply_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.reply_rows.length; i++) {
                if (app.vue.reply_rows[i].id === id) {
                    for (let j = 0; j < app.vue.comment_rows.length; j += 1) {
                        if (app.vue.comment_rows[j].id == app.vue.reply_rows[row_idx].comment_id) {
                            app.vue.comment_rows[j].num_replies -= 1;
                            break;
                        }
                    }
                    app.vue.reply_rows.splice(i, 1);
                    app.enumerate(app.vue.reply_rows);
                    break;
                }
            }
        });
    };

    // Edits a user's comment and updates the database.
    app.edit_comment = function(row_idx, new_comment) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(edit_comment_url, {params: {id: id, new_comment: new_comment}}).then(function (response) {
            app.vue.comment_rows[row_idx].comment_content = new_comment;
            app.vue.comment_rows[row_idx].temp_comment_content = new_comment;
        }); 
    };

    // Edits a user's reply and updates the database.
    app.edit_reply = function(row_idx, new_reply) {
        let id = app.vue.reply_rows[row_idx].id;
        axios.get(edit_reply_url, {params: {id: id, new_reply: new_reply}}).then(function (response) {
            app.vue.reply_rows[row_idx].reply_content = new_reply;
            app.vue.reply_rows[row_idx].temp_reply_content = new_reply;
        }); 
    };

    // Likes a comment and updates the database.
    app.like_comment = function (row_idx) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(add_liker_url, {params: {id: id}}).then(function (response) {
            if (app.vue.comment_rows[row_idx].disliked){
                app.undislike_comment(row_idx);
            }
            app.set_liked_mode(row_idx, true); 
            app.vue.comment_rows[row_idx].count++;
        });
        
    };

    // Unlikes a comment and updates the database.
    app.unlike_comment = function (row_idx) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(remove_liker_url, {params: {id: id}}).then(function (response) {
            app.vue.comment_rows[row_idx].count--;
            app.set_liked_mode(row_idx, false); 
        });
    };

    // Dislikes a comment and updates the database.
    app.dislike_comment = function (row_idx) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(add_disliker_url, {params: {id: id}}).then(function (response) {
            if (app.vue.comment_rows[row_idx].liked) {
                app.unlike_comment(row_idx);
            }
            app.set_disliked_mode(row_idx, true);
            app.vue.comment_rows[row_idx].count--;
        });
    };

    // Undislikes a comment and updates the database.
    app.undislike_comment = function (row_idx) {
        let id = app.vue.comment_rows[row_idx].id;
        axios.get(remove_disliker_url, {params: {id: id}}).then(function (response) {
            app.vue.comment_rows[row_idx].count++;
            app.set_disliked_mode(row_idx, false); 
        });
    };

    // Updates add_comment_mode, which is used to check if the comment form should be displayed or not.
    app.set_add_comment_mode = function (new_mode) {
        app.vue.add_comment_mode = new_mode;
    };

    // Sets the user's like status of a comment.
    app.set_liked_mode = function (row_idx, new_mode) {
        app.vue.comment_rows[row_idx].liked = new_mode;
    };
    // Sets the user's dislike status of a comment.
    app.set_disliked_mode = function (row_idx, new_mode) {
        app.vue.comment_rows[row_idx].disliked = new_mode;
    }
    
    // Sets the comment's edit_mode field, which enables/disables the user to edit their comment.
    app.set_comment_edit_mode = function (row_idx, new_mode) {
        app.vue.comment_rows[row_idx].edit_mode = new_mode;
    }

    // Sets the reply's edit_mode field, which enables/disables the user to reply to a comment.
    app.set_reply_edit_mode = function (row_idx, new_mode) {
        app.vue.reply_rows[row_idx].edit_mode = new_mode;
    }
    
    // Sets the comment's reply_mode field, which enables/disables the user to reply to a comment.
    app.set_reply_mode = function (row_idx, new_mode) {
        app.vue.comment_rows[row_idx].reply_mode = new_mode;
    }

    // Sets the comment's show_replies field, which enables the user to see replies or not.
    app.set_show_replies = function (row_idx, new_mode) {
        app.vue.comment_rows[row_idx].show_replies = new_mode;
    }

    // Resets the comment_form.
    // This is done after the user submits or cancels a comment.
    app.reset_comment_form = function () {
        app.vue.comment_content = "";
    }

    // Resets the reply_form.
    // This is done after the user submits or cancels a reply.
    app.reset_reply_form = function (row_idx) {
        app.vue.comment_rows[row_idx].reply_content = "";
    }

    // Resets temp_comment_content back to comment_content (original state).
    // This is done if the user cancels an edit of the comment.
    app.reset_temp_comment_content = function (row_idx) {
        app.vue.comment_rows[row_idx].temp_comment_content = app.vue.comment_rows[row_idx].comment_content;
    }

    // Resets temp_reply_content back to reply_content (original state).
    // This is done if the user cancels an edit of the reply.
    app.reset_temp_reply_content = function (row_idx) {
        app.vue.reply_rows[row_idx].temp_reply_content = app.vue.reply_rows[row_idx].reply_content;
    }


    // This contains all the methods.
    app.methods = {
        // Functions that interact and update fields in the database.
        // e.g. add_reply() adds a reply to the database.
        add_comment: app.add_comment,
        add_reply: app.add_reply,
        delete_comment: app.delete_comment,
        delete_reply: app.delete_reply,
        edit_comment: app.edit_comment,
        edit_reply: app.edit_reply,
        like_comment: app.like_comment,
        unlike_comment: app.unlike_comment,
        dislike_comment: app.dislike_comment,
        undislike_comment: app.undislike_comment,

        // Setters.
        // These setters update vue variables which keep track of states on the apps.
        // e.g. We need to keep track of whether or not a user liked a comment, to display the page appropriately.
        set_add_comment_mode: app.set_add_comment_mode,
        set_liked_mode: app.set_liked_mode,
        set_disliked_mode: app.set_disliked_mode,
        set_comment_edit_mode: app.set_comment_edit_mode,
        set_reply_edit_mode: app.set_reply_edit_mode,
        set_reply_mode: app.set_reply_mode,
        set_show_replies: app.set_show_replies,

        // Resetters.
        // These functions reset vue variables when necessary.
        // e.g. We cancel creating a comment, and we want to restore the original state.
        reset_comment_form: app.reset_comment_form,
        reset_reply_form: app.reset_reply_form,
        reset_temp_comment_content: app.reset_temp_comment_content,
        reset_temp_reply_content: app.reset_temp_reply_content,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });


    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        
        // Get the user's email.
        axios.get(get_user_email_url).then(function (response) {
            app.vue.user_email = response.data.user_email;
        });

        // Get the user's name.
        axios.get(get_name_url).then(function (response) {
            app.vue.name = response.data.name;
        });

        // Load the comments into comment_rows.
        // Add fields to each row, which makes it easier to maintain the front-end.
        // Descriptions of each field are provided belwo.
        axios.get(load_comments_url).then(function (response) {
            comment_rows = response.data.comment_rows;
            for (let i = 0; i < comment_rows.length; i++) {
                comment_rows[i].temp_comment_content = comment_rows[i].comment_content; // Used as a backup when the user edits their comment.
                comment_rows[i].liked = (comment_rows[i].likers.includes(app.vue.user_email)); // Checks if the user liked a comment.
                comment_rows[i].disliked = (comment_rows[i].dislikers.includes(app.vue.user_email)); // Checks if the user disliked a comment.
                comment_rows[i].count = comment_rows[i].likers.length - comment_rows[i].dislikers.length; // Keeps track of a comment's number of likes.
                comment_rows[i].edit_mode = false; // Checks if comment editing is enabled,
                comment_rows[i].reply_content = ""; // Stores a reply to a comment, when it is being typed.
                comment_rows[i].reply_mode = false; // Checks if comment replying is enabled.
                comment_rows[i].show_replies = false; // Checks if displaying replies is enabled.
                comment_rows[i].num_replies = 0; // Keeps track of how many replies a comment has.
            }
            app.vue.comment_rows = app.enumerate(comment_rows);   
        });

        // Load the replies into reply_rows.
        // Add fields to each row, which makes it easier to maintain the front-end.
        axios.get(load_replies_url).then(function (response) {
            reply_rows = response.data.reply_rows;
            for (let i = 0; i < app.vue.comment_rows.length; i += 1) {
                for (let j = 0; j < reply_rows.length; j += 1) {
                    // If the reply corresponds to the comment, then increment that comment's number of replies.
                    if (comment_rows[i].id == reply_rows[j].comment_id) {
                        comment_rows[i].num_replies += 1;
                    }
                } 
            }
            for (let i = 0; i < reply_rows.length; i += 1) {
                reply_rows[i].temp_reply_content = reply_rows[i].reply_content; // Used as a backup when the user edits their reply.
                reply_rows[i].edit_mode = false; // Checks if reply editing is enabled.
            }
            app.vue.reply_rows = app.enumerate(reply_rows);
        });
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
