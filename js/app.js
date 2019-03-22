/*jshint esversion: 6 */

const DateTime = luxon.DateTime;
const today = DateTime.local().setLocale('cs');

function appendEvents(events, elementId) {
  if (events.items.length > 0) {
    const outlet = document.getElementById(elementId);
    const header = document.createElement('span');
    header.innerText = events.summary;
    header.classList.add('text-muted');
    header.classList.add('font-bold', 'text-grey', 'text-2xl', 'px-3', 'mt-8', 'mb-8');
    outlet.appendChild(header);
    const template = document.getElementById('evtTemplate');
    const eventHide = /\[.*\]/;
    events.items.forEach(event => {
      const node = document.importNode(template.content, true);
      const title = event.summary.replace(eventHide, '');
      const start = eventDate(event.start);
      const date = dateOf(start).split(' ');
      if(elementId !== 'regularEvents'){
        node.querySelector('.evtDate').textContent = date[0];
        node.querySelector('.evtMonth').textContent = date[1];
      }
      else {
        node.querySelector('.evtDate').classList.remove('w-6');
        node.querySelector('.evtMonth').classList.remove('w-12', 'pl-3');
      }
      node.querySelector('.evtTime').textContent = timeOrBlankOf(start);
      node.querySelector('.evtWeekDay').textContent = weekDayOf(start);
      node.querySelector('.evtTitle').textContent = title;
      const eventDetail = node.querySelector('.evtDetail');
      if (event.description) {
        eventDetail.innerHTML = event.description;
      } else {
        eventDetail.parentNode.removeChild(eventDetail);
      }
      const eventLinks = node.querySelector('.evtLinks');
      if (event.attachments && event.attachments.length > 0) {
        const attachments = [];
        event.attachments.forEach(attachment => {
          const title = attachment.title.substring(0, attachment.title.length - 4);
          const link = linkOf(title, attachment.fileUrl);
          attachments.push(link);
        });
        attachments.forEach((attachment, index) => {
          if (index > 0) {
            eventLinks.appendChild(document.createTextNode(' | '));
          }
          eventLinks.appendChild(attachment);
        });
      } else {
        eventLinks.parentNode.removeChild(eventLinks);
      }
      outlet.appendChild(node);
    });
  }
}

function linkOf(title, url) {
  const a = document.createElement('a');
  a.appendChild(document.createTextNode(title));
  a.title = title;
  a.href = url;
  a.target = '_blank';
  return a;
}

function eventDate(date) {
  return DateTime.fromISO(date.dateTime ? date.dateTime : date.date).setLocale('cs');
}

function weekDayOf(date) {
  return date.toFormat('ccc');
}

function dateOf(date) {
  return today.year === date.year ? date.toFormat('d. LLL') : date.toFormat('d. LLL yyyy');
}

function timeOrBlankOf(date) {
  return date.hour === 0 && date.minute === 0 ? '' : date.toFormat('HH:mm');
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
