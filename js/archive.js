/*jshint esversion: 6 */

const DateTime = luxon.DateTime;
const today = DateTime.local().setLocale('cs');

function dateOf(date) {
  return today.year === date.year ? date.toFormat('d. LLL') : date.toFormat('d. LLL yyyy');
}

function appendMessages(files, elementId) {
  const outlet = document.getElementById(elementId);
  const template = document.getElementById('msgTemplate');
  
  while (outlet.hasChildNodes()) {
    outlet.removeChild(outlet.lastChild);
  }

  files.forEach(file => {
    const meta = parseFile(file);
    const node = document.importNode(template.content, true);
    node.querySelector('.msgDate').textContent = dateOf(meta.date);
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
function fetchArchiveMessages(ga,messagesYear = 2019) {
ga.init().then(() => {
  let  messagesQuery = {
      orderBy: 'name asc',
      pageSize: 60,
      q: `mimeType='audio/mp3' and name contains '${messagesYear}' and trashed=false`,
      fields: 'files(id, name, webViewLink, webContentLink)'
    };
  
  ga.files(messagesQuery).then(res => { appendMessages(res.files, 'messages-list')});
}).catch(console.error)};


function appendYearTitle(title=2019) {
  const archiveHeader = document.querySelector('#archive-title');
  archiveHeader.textContent = `Rok ${title}`;
}

(function()  {                            
    const menu = document.querySelector('.dropdown');
    const menuContent = document.querySelector('.dropdown-content');
    menu.addEventListener('click',() => {
        if(menuContent.classList.contains('hidden')){
            menuContent.classList.remove('hidden');
        }
        else{
            menuContent.classList.add('hidden');
        }
    });
})();


(function (){
  const archiveMenu = document.querySelector('.dropdown-content');
  for(let menuItem of archiveMenu.children){
    menuItem.addEventListener('click',()=>{
      const itemID = menuItem.id;
      fetchArchiveMessages(ga,itemID);
      appendYearTitle(itemID);
    });
  }
})();



(function (){
  fetchArchiveMessages(ga);
  appendYearTitle();
})(); 