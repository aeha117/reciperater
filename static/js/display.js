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
        is_breakfast: false,
        is_lunch: false,
        is_dinner: false,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.reset_form = function () {
        app.vue.recipe_name = "";
        app.vue.instructions = "";
        app.vue.curr_ingredient = "";
        app.vue.curr_quantity = 0;
        app.vue.ingredients = [];
        app.vue.estimated_time = "";
        app.vue.is_breakfast = false;
        app.vue.is_lunch = false;
        app.vue.is_dinner = false;
    }

    app.set_breakfast = function (new_mode) {
        app.vue.is_breakfast = new_mode;
    };
    app.set_lunch = function (new_mode) {
        app.vue.is_lunch = new_mode;
    };
    app.set_dinner = function (new_mode) {
        app.vue.is_dinner = new_mode;
    };
    app.inc_curr_quantity = function () {
        app.vue.curr_quantity += 1;
    }
    app.dec_curr_quantity = function () {
        if (app.vue.curr_quantity != 0) {
            app.vue.curr_quantity -= 1;
        }
    }

    app.add_ingredient = function () {
        app.vue.ingredients.push({
            ingredient: app.vue.curr_ingredient,
            quantity: app.vue.curr_quantity,
        });
        app.enumerate(app.vue.ingredients);
        app.vue.curr_ingredient = "";
        app.vue.curr_quantity = 0;
    }

    app.add_recipe = function () {
        tags = []
        if (app.vue.is_breakfast == true) { tags.push("Breakfast"); }
        if (app.vue.is_lunch == true) {tags.push("Lunch"); }
        if (app.vue.is_dinner == true) {tags.push("Dinner"); }
        axios.post(add_recipe_url,
            {
                recipe_name: app.vue.recipe_name,
                recipe_time: app.vue.estimated_time,
                recipe_content: app.vue.instructions,
                ingredients: app.vue.ingredients,
                tags: tags,
            }).then(function (response) {
                app.reset_form();
        });
    }

    app.delete_ingredient = function (row_idx) {
        app.vue.ingredients.splice(row_idx, 1);
        app.enumerate(app.vue.ingredients);
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        reset_form: app.reset_form,
        set_breakfast: app.set_breakfast,
        set_lunch: app.set_lunch,
        set_dinner: app.set_dinner,
        add_ingredient: app.add_ingredient,
        add_recipe: app.add_recipe,
        delete_ingredient: app.delete_ingredient,
        inc_curr_quantity: app.inc_curr_quantity,
        dec_curr_quantity: app.dec_curr_quantity,
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
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
