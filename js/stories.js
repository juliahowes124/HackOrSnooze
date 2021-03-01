"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  //TODO: CHANGE TO ONE ICON CHANGE FAR/FAS CLASS
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span>
          <i class="fas fa-trash hidden"></i>
        </span>
        <i class="far fa-star"></i>
        <i class="fas fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */


function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    updateStarIcon(story, $story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets favorited stories, generates their HTML, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  let favorited = storyList.stories.filter(story => story.favorite);

  // generate HTML for stories and append to stories list
  for (let story of favorited) {
    const $story = generateStoryMarkup(story);
    updateStarIcon(story, $story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}

/** Gets own stories, generates their HTML, and puts on page. */

function putMyStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  let myStories = storyList.stories.filter(story => story.username === currentUser.username);
  // generate HTML for stories and append to stories list
  for (let story of myStories) {
    const $story = generateStoryMarkup(story);
    updateStarIcon(story, $story);
    $story.find('.fa-trash').removeClass('hidden'); // or create trash can
    $story.append('<button class="edit-btn">Edit</button>');
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}


//could merge above two with input stories and a flag - not really worth it

/** grabs form values, adds new story and prepends to list */
async function handleStorySubmit(evt) {
  evt.preventDefault();
  let author = $("#author").val();
  let title = $("#title").val();
  let url = $("#url").val();
  let story = await storyList.addStory(currentUser, { author, title, url });
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  updateStarIcon(story, $story);
  $storyForm.hide();
}

$storyForm.on('submit', handleStorySubmit);

function handleStarClick(evt) {
  let idToLookFor = $(evt.target).parent().attr("id")
  let storyToUpdate = findStoryFromStoryId(idToLookFor);

  if (storyToUpdate.favorite) {
    currentUser.deleteFavorite(storyToUpdate);
    $(evt.target).addClass('hidden');
    $(evt.target).prev().removeClass('hidden');
  } else {
    currentUser.addFavorite(storyToUpdate);
    $(evt.target).addClass('hidden');
    $(evt.target).next().removeClass('hidden');
  }
}

$allStoriesList.on('click', ".fa-star", handleStarClick);

//TODO: MAKE THIS A STORYLIST CLASS METHOD
function findStoryFromStoryId(storyId) {
  for (let story of storyList.stories) {
    if (story.storyId === storyId) {
      return story
    }
  }
}

function updateStarIcon(story, $story) {
  if (story.favorite) {
    $story.children('.far').addClass('hidden');
    $story.children('.fas').removeClass('hidden');
  } else {
    $story.children('.fas').addClass('hidden');
    $story.children('.far').removeClass('hidden');
  }
}

function handleTrashClick(evt) {
  let idToLookFor = $(evt.target).parent().parent().attr("id") //closest
  let storyToDelete = findStoryFromStoryId(idToLookFor) // or storyList.stories.find()
  storyList.deleteStory(storyToDelete);
  $(evt.target).parent().parent().remove();
}

$allStoriesList.on('click', ".fa-trash", handleTrashClick);

function handleEditClick(evt) {
  $(evt.target).parent().append(generateEditForm());
}

function generateEditForm() {
  return `
  <input placeholder='title'></input>
  <input placeholder='author'></input>
  <button class="edit-submit-btn">Submit</button>`
}

$allStoriesList.on('click', ".edit-btn", handleEditClick);

async function handleEditSubmitClick(evt) {
  let idToLookFor = $(evt.target).parent().attr("id");
  let storyToEdit = findStoryFromStoryId(idToLookFor);
  let inputFields = $(evt.target).parent().find('input');
  let newStoryData = {
    title: inputFields[0].value || undefined,
    author: inputFields[1].value || undefined
  }
  await storyList.editStory(storyToEdit, newStoryData); //need to await so that putMyStoriesOnPage isn't called until request is complete
  putMyStoriesOnPage();
}

async function handleScrollDown(evt) {
  let newStoryList = await StoryList.getStories(storyList.stories.length);
  storyList.stories = storyList.stories.concat(newStoryList.stories);
  putStoriesOnPage();
}

$allStoriesList.on('click', ".edit-submit-btn", handleEditSubmitClick);
$(window).scroll(() => {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    handleScrollDown();
  }
});
