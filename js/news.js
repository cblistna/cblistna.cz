appendDate
/*jshint esversion: 6 */

const DateTime = luxon.DateTime;
const today = DateTime.local().setLocale('cs');


function appendEvents(events, elementId) {
  if (events.items.length > 0) {
    const outlet = document.getElementById(elementId);
    const header = document.createElement('span');
    header.innerText = events.summary;
    header.classList.add('font-bold', 'text-grey', 'text-2xl', 'px-3', 'mt-8', 'mb-8');
    outlet.appendChild(header);
    const template = document.getElementById('evtTemplate');
    const eventHide = /( ?\[.*\]|!$)/g;
    events.items.forEach(event => {
      const node = document.importNode(template.content, true);
      const title = event.summary.replace(eventHide, '');
      const start = eventDate(event.start);
      node.querySelector('.evtDate').textContent = dateOf(start);
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

const todaySpan = document.getElementById('today-date');
todaySpan.textContent = today.toFormat('d. LLLL yyyy');

const ga = new GoogleAccess('cblistna', '122939969451-nm6pc9104kg6m7avh3pq8sn735ha9jja.apps.googleusercontent.com', 'iFas6FSxexJ0ztqx6QfUH8kK', '1/4tbmdLZ3tItmdMx1zIoc9ZdlBZ8E854-t1whajGynYw');

ga.init().then(() => {
  const now = new Date();
  const eventsBaseQuery = {
    timeMin: now.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 100
  };
  
  const regularEventsQuery = Object.assign({
    timeMax: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
  }, eventsBaseQuery);

  ga.eventsOf('cblistna@gmail.com', regularEventsQuery).then(events => {
    const nowPlus7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    events.items = events.items.filter(event => (eventDate(event.start) < nowPlus7Days) || event.summary.endsWith('!'));
    appendEvents(events, 'regularEvents');
  });

  ga.eventsOf('seps8o249ihvkvdhgael78ofg0@group.calendar.google.com', eventsBaseQuery).then(events => appendEvents(events, 'irregularEvents'));

  ga.eventsOf('852scvjhsuhhl97lv3kb8r7be8@group.calendar.google.com', eventsBaseQuery).then(events => appendEvents(events, 'otherEvents'));

}).catch(console.error);
