// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        recipes: [],
        searchbar_val: "",
        search_terms: [],
        search_tags: [],
        search_users: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {
            e._idx = k++;
        });
        return a;
    };

    app.decorate = (recipes) => {
        return recipes.map((recipe) => {
            recipe.tags = []
            recipe.recipe_likes = (recipe.likers === null) ? 0 : recipe.likers.length
            recipe.recipe_dislikes = (recipe.dislikers === null) ? 0 : recipe.dislikers.length
        })
    }

    app.get_recipes = function () {
        console.log(app.vue.search_terms, app.vue.search_tags, app.vue.search_users)

        axios.get(get_recipes_url, {
            params: {
                search_terms: app.vue.search_terms.join('+'),
                search_tags: app.vue.search_tags.join('+'),
                search_users: app.vue.search_users.join('+')
            }
        }).then((response) => {
            let recipes = response.data.recipes
            app.enumerate(recipes)
            app.decorate(recipes)
            app.vue.recipes = recipes

            app.vue.recipes.map((recipe) => {
                recipe.createdDate = new Date(recipe.date_created)
            })

            app.vue.recipes.map((recipe) => {
                axios.get(get_tags_url, {params: {recipe_id: recipe.id}})
                    .then((response) => {
                        recipe.tags = app.enumerate(response.data.tags)
                    })
            })
        })
    }

    app.select_tag = function (recipe_idx, tag_idx) {
        let searchbar = document.getElementById("search_bar")
        let tag_name = app.vue.recipes[recipe_idx].tags[tag_idx].tag_name
        app.vue.searchbar_val += " #" + tag_name
        searchbar.focus()
        app.update_filters()
    }

    app.update_filters = function () {
        let filter_str = app.vue.searchbar_val;
        const tag_regex = /(?<=#)\w+/g
        const user_regex = /(?<=user:)[\w.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
        let search_tags = filter_str.match(tag_regex)
        let search_users = filter_str.match(user_regex)
        filter_str = filter_str.replace(/#\S+/g, "")
        filter_str = filter_str.replace(/user:\S+/g, "")
        let search_terms = filter_str.match(/\S+/g)
        app.vue.search_terms = (search_terms === null) ? [] : search_terms
        app.vue.search_tags = (search_tags === null) ? [] : search_tags
        app.vue.search_users = (search_users === null) ? [] : search_users

        app.get_recipes()
    }

    app.clicked_recipe = function (recipe_idx) {
        window.location = display_base_url + app.vue.recipes[recipe_idx].id
    }

    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        select_tag: app.select_tag,
        clicked_recipe: app.clicked_recipe,
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
        document.getElementById("search_bar").oninput = Q.debounce(app.update_filters, 300)
        app.get_recipes()
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);
