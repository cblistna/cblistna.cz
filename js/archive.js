/*jshint esversion: 6 */

const DateTime = luxon.DateTime;
const today = DateTime.local().setLocale('cs');

function dateOf(date) {
  return today.year === date.year ? date.toFormat('d. LLL') : date.toFormat('d. LLL yyyy');
}


function appendMessages(files, elementId) {
  const outlet = document.getElementById(elementId);
  const template = document.getElementById('msgTemplate');
  files.forEach(file => {
    const meta = parseFile(file);
    const node = document.importNode(template.content, true);
    node.querySelector('.msgDate').textContent = dateOf(meta.date);
    // node.querySelector('.msgTitle').textContent = meta.title;
    node.querySelector('.msgAuthor').textContent = meta.author;

    const link = document.createElement('a');
    link.appendChild(document.createTextNode(meta.title));
    link.title = meta.title;
    link.href = file.webContentLink.substring(0, file.webContentLink.indexOf('&export='));
    link.target = '_blank';
    link.classList.add('no-underline');
    node.querySelector('.msgTitle').appendChild(link);

    outlet.appendChild(node);
  });
}

function parseFile(file) {
  const meta = {
    file: file.name
  };
  const parts = file.name.substring(0, file.name.length - 4).split(/-/, -1);
  const dateRaw = parts.shift();
  meta.date = DateTime.fromISO(dateRaw.substring(0, 4) + '-' + dateRaw.substring(4, 6) + '-' + dateRaw.substring(6, 8)).setLocale('cs');
  meta.author = parts.shift();
  meta.title = parts.shift();
  meta.tags = [];
  parts.forEach(part => {
    if (part.startsWith('#')) {
      meta.tags.push(part.substring(1));
    }
  });
  return meta;
}

function appendDate(now){
  const dateHeader = document.getElementById('today-date');
  if(dateHeader){
    const dateText = document.createTextNode(` ${now.toLocaleDateString()}`);
    dateHeader.append(dateText);
  }
}

function openArchiveMenu(){
    const menuContent = document.querySelector('.dropdown-content');
    const menu = document.querySelector('.dropdown');
    menu.addEventListener('click',() => {
        if(menuContent.classList.contains('hidden')){
            menuContent.classList.remove('hidden');
        }
        else{
            menuContent.classList.add('hidden');
        }
    });
}


const ga = new GoogleAccess('cblistna', '122939969451-nm6pc9104kg6m7avh3pq8sn735ha9jja.apps.googleusercontent.com', 'iFas6FSxexJ0ztqx6QfUH8kK', '1/4tbmdLZ3tItmdMx1zIoc9ZdlBZ8E854-t1whajGynYw');

ga.init().then(() => {
  const now = new Date();
  const eventsBaseQuery = {
    timeMin: now.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 10
  };

  const regularEventsQuery = Object.assign({
    timeMax: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }, eventsBaseQuery);

  ga.eventsOf('cblistna@gmail.com', regularEventsQuery).then(events => {
    appendEvents(events, 'regularEvents');
  });

  ga.eventsOf('seps8o249ihvkvdhgael78ofg0@group.calendar.google.com', eventsBaseQuery).then(events => appendEvents(events, 'irregularEvents'));

  ga.eventsOf('852scvjhsuhhl97lv3kb8r7be8@group.calendar.google.com', eventsBaseQuery).then(events => appendEvents(events, 'otherEvents'));

  appendDate(new Date());
  // ga
  //   .eventsOf(
  //     'm1b2v3tb387ace2jjub70mq6vo@group.calendar.google.com',
  //     eventsBaseQuery
  //   )
  //   .then(events => appendEvents(events, 'worshipEvents'));

  const messagesQuery = {
    orderBy: 'name desc',
    pageSize: 10,
    q: "mimeType='audio/mp3' and trashed=false",
    fields: 'files(id, name, webViewLink, webContentLink)'
  };

  ga.files(messagesQuery).then(res => appendMessages(res.files, 'messages-list'));
}).catch(console.error);

openArchiveMenu();
