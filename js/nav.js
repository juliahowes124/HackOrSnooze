"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** Show User info on click on "[username]" */
function navUsernameClick() {
  hidePageComponents();
  const createdAt = currentUser.createdAt.split('T')[0]
  $userInfo.empty();
  $userInfo.show();
  $userInfo.append(`<h3>User Info</h3>
  <p>Name: ${currentUser.name}</p>
  <p>Username: ${currentUser.username}</p>
  <p>Account Created: ${createdAt}</p>`)
}

$navUserProfile.on('click', navUsernameClick);



/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Display new story form */
function navNewStoryClick(evt) {
  $storyForm.show();
  $userInfo.hide();
}

$navSubmit.on("click", navNewStoryClick);

//handle favorites being clicked on nav

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  putFavoritesOnPage();
}

$navFavorites.on("click", navFavoritesClick);


//handle my stories being clicked on nav
function navMyStoriesClick(evt) {
  console.debug("navFavoritesClick", evt);
  putMyStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);


