import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // 1) update resultView and update bookmarks
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 2) render spinner
    recipeView.renderSpinner();

    // 3) from model.js fetch api data
    await model.loadRecipe(id);

    // 4) Render Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    // 1) render spinner
    resultsView.renderSpinner();

    // 2) fetch query form searchView class
    const query = searchView.getQuery();
    if (!query) return;

    // 3) load all search result from model
    await model.loadSearchResult(query);

    // 4) render search results by page
    resultsView.render(model.getSearchResultsPage());

    // 5) render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) render search results by page
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) render pagination buttons
  paginationView.render(model.state.search);
};

const controlUpdateServings = function (newServings) {
  model.updateNewServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // 1) render spinner
    addRecipeView.renderSpinner();

    // 2) upload recipe
    await model.uploadRecipe(newRecipe);

    // 4) render successful message
    addRecipeView.renderMessage();

    // 3) render recipe
    recipeView.render(model.state.recipe);

    // 5) add to the bookmark
    bookmarksView.render(model.state.bookmarks);

    // 6) change recipe url-id
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 7) timeout message
    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlUpdateServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerAddRecipe(controlAddRecipe);
};
init();
