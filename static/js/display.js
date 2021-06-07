// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        user_email: "",
        name: "",
        recipe_name: "",
        instructions: "",
        curr_ingredient: "",
        curr_quantity: 0,
        ingredients: [],
        estimated_time: "",
        curr_tag: "",
        tags: [],
        is_breakfast: false,
        is_lunch: false,
        is_dinner: false,
        thumbnail: "",
        curr_mode: "edit", // Two modes: edit, view
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {
            e._idx = k++;
        });
        return a;
    };

    // Resets the form after the user submits their recipe.
    app.reset_form = function () {
        app.vue.recipe_name = "";
        app.vue.instructions = "";
        app.vue.curr_ingredient = "";
        app.vue.curr_quantity = 0;
        app.vue.ingredients = [];
        app.vue.estimated_time = "";
        app.vue.curr_tag = "";
        app.vue.tags = [];
        app.vue.is_breakfast = false;
        app.vue.is_lunch = false;
        app.vue.is_dinner = false;
        app.vue.thumbnail = "";
    }

    app.reset_thumbnail = function () {
        app.vue.thumbnail = ""
    }

    /* Setters used to update the tag flags (is_breakfast, is_lunch, is_dinner) */
    app.set_breakfast = function (new_mode) {
        if (app.vue.curr_mode === "edit") {
            app.vue.is_breakfast = new_mode;
        }
    };
    app.set_lunch = function (new_mode) {
        if (app.vue.curr_mode === "edit") {
            app.vue.is_lunch = new_mode;
        }
    };
    app.set_dinner = function (new_mode) {
        if (app.vue.curr_mode === "edit") {
            app.vue.is_dinner = new_mode;
        }
    };

    /* Updates the quantity. Increments/Decrements it when the user uses the buttons */
    app.inc_curr_quantity = function () {
        app.vue.curr_quantity += 1;
    }
    app.dec_curr_quantity = function () {
        if (app.vue.curr_quantity != 0) {
            app.vue.curr_quantity -= 1;
        }
    }

    // Adds an ingredient to the list of ingredients.
    // Once the recipe is submitted, this list will be sent to the db.
    app.add_ingredient = function () {
        app.vue.ingredients.push({
            ingredient: app.vue.curr_ingredient,
            quantity: app.vue.curr_quantity,
        });
        app.enumerate(app.vue.ingredients);
        app.vue.curr_ingredient = "";
        app.vue.curr_quantity = 0;
    }

    // Adds a tag to the list of tags.
    // Once the recipe is submitted, this list will be sent to the db.
    app.add_tag = function () {
        app.vue.tags.push({tag: app.vue.curr_tag});
        app.enumerate(app.vue.tags);
        app.vue.curr_tag = "";
    }

    // Adds a recipe to the database.
    app.add_recipe = function () {
        if (app.vue.is_breakfast === true) {
            app.vue.tags.push({tag: "Breakfast"});
        }
        if (app.vue.is_lunch === true) {
            app.vue.tags.push({tag: "Lunch"});
        }
        if (app.vue.is_dinner === true) {
            app.vue.tags.push({tag: "Dinner"});
        }
        axios.post(add_recipe_url,
            {
                recipe_name: app.vue.recipe_name,
                recipe_time: app.vue.estimated_time,
                recipe_content: app.vue.instructions,
                ingredients: app.vue.ingredients,
                tags: app.vue.tags,
            }).then(function (response) {
            app.reset_form();
        });
    }
    
    // Deletes recipe from database
    app.delete_recipe = function(row_idx) {
        let id = app.vue.rows[row_idx].id;
        axios.get(delete_recipe_url, {params: {id: id}}).then(function (response) {
            for (let i = 0; i < app.vue.rows.length; i++) {
                if (app.vue.rows[i].id === id) {
                    app.vue.rows.splice(i, 1);
                    app.enumerate(app.vue.rows);
                    break;
                }
            }
            });
    };

    // Deletes an ingredient from the local list of ingredients.
    app.delete_ingredient = function (row_idx) {
        app.vue.ingredients.splice(row_idx, 1);
        app.enumerate(app.vue.ingredients);
    }

    // Deletes a tag from the local list of tags.
    app.delete_tag = function (row_idx) {
        app.vue.tags.splice(row_idx, 1);
        app.enumerate(app.vue.tags);
    }

    // Uploads the image of the recipe onto the screen.
    app.upload_image = function (event) {
        let input = event.target;
        let file = input.files[0];
        if (file) {
            let reader = new FileReader();
            reader.addEventListener("load", function () {
                // Sends the image to the server.
                axios.post(upload_thumbnail_url,
                    {
                        recipe_id: recipe.id,
                        thumbnail: reader.result,
                    })
                    .then(function () {
                        // Sets the local preview.
                        row.thumbnail = reader.result;

                    });
            });
            reader.readAsDataURL(file);
        }
    };

    app.load_recipe = function () {
        app.vue.recipe_name = recipe.recipe_name
        app.vue.instructions = recipe.recipe_content
        app.vue.estimated_time = recipe.recipe_time
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        reset_form: app.reset_form,
        reset_thumbnail: app.reset_thumbnail,
        set_breakfast: app.set_breakfast,
        set_lunch: app.set_lunch,
        set_dinner: app.set_dinner,
        add_ingredient: app.add_ingredient,
        add_tag: app.add_tag,
        add_recipe: app.add_recipe,
        delete_recipe: app.delete_recipe,
        delete_ingredient: app.delete_ingredient,
        delete_tag: app.delete_tag,
        inc_curr_quantity: app.inc_curr_quantity,
        dec_curr_quantity: app.dec_curr_quantity,
        upload_image: app.upload_image,
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
        app.load_recipe()
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
