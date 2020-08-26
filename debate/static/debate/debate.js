document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#topics').style.display = 'none';
    document.querySelector('#home').style.display = 'block';
    openNav();
    openNew();
    console.log(user_following);
    document.querySelectorAll('.links').forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', () => {
            const id = link.id;
            topics(id);
            fetch_discussion(`/topic/${id}`);
            new_discussion(id);
            openNav();
        });
    });
});

window.onpopstate = function(event){
    fetch_discussion(`/topic/${event.state.id}`);
}

function topics(id) {
    document.querySelector('#topics').style.display = 'block';
    document.querySelector('#home').style.display = 'none';
    document.querySelectorAll('.links').forEach(link => {link.querySelector('span').classList.remove('active')});
    document.getElementById(`${id}`).querySelector('span').classList.add('active');
    document.getElementById('sub-topics').innerHTML = "";
    document.querySelector('#message').innerHTML = "";
    let new_discussion = document.getElementById('new-discussion');
    new_discussion.querySelector('#new-subtopic').value = "";
    new_discussion.querySelector('#OA').value = "";
    document.querySelector('#argument-error').innerHTML = "";
    document.querySelector('#name-error').innerHTML = "";
}

function openNav() {
    if (document.getElementById("mySidepanel").style.width === "0px") {
        document.getElementById("mySidepanel").style.width = "250px";
    } else {    
        document.getElementById("mySidepanel").style.width = "0";
    }
  }
  
function string_to_slug (str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaeeeeiiiioooouuuunc------";
    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}

function openNew() {
    let ND = document.getElementById('new-discussion');
    if (ND.style.display === "none") {
        document.querySelector("#new-discussion-button").classList.replace('btn-outline-primary', 'btn-primary');
        ND.style.display = "block";
    } else {
        document.querySelector("#new-discussion-button").classList.replace('btn-primary', 'btn-outline-primary');
        ND.style.display = "none";
    }
}

function new_discussion(id) {
    let new_discussion = document.getElementById('new-discussion');
    new_discussion.querySelector('#new-discussion-form').onsubmit = () => {
        document.querySelector('#message').innerHTML = "";
        document.querySelector('#argument-error').innerHTML = "";
        document.querySelector('#name-error').innerHTML = "";
        const name = new_discussion.querySelector('#new-subtopic').value;
        const argument = new_discussion.querySelector('#OA').value;
        fetch(`/topic/${id}`, {
            method: 'POST',
            body: JSON.stringify({
                name: name,
                argument: argument
            })
        })
        .then(response => response.json())
        .then(message => {
            console.log(message)
            if (message.message === "success") { 
                topics(id);
                fetch_discussion(`/topic/${id}`);
            }
            if (message.does_not_exist) {
                document.querySelector('#message').innerHTML = `${message.does_not_exist}`;
            }
            if (message[0]) {
                if (message[0].opening_argument) {
                document.querySelector('#argument-error').innerHTML = `${message[0].opening_argument}`;
                } if (message[0].name) {
                document.querySelector('#name-error').innerHTML = `${message[0].name}`;
                } if (message[0].slug) {
                document.querySelector('#name-error').innerHTML = "Discussion already exists."
                }
            } 
        });
        return false
    }
}

function follow(id) {
    let d = document.getElementById(`discussion-${id}`);
    fetch(`/argument/${id}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result.message);
        if (d.querySelector('#follow_span').classList.contains('followed')) {
            d.querySelector('#follow_span').innerHTML = `
            <button data-id="${id}" class="btn btn-sm btn-outline-primary follow mb-2">Follow</button>
            `;
            d.querySelector('#follow_span').classList.remove('followed');
            d.querySelector('.follow').addEventListener('click', () => {follow(id)});
        } else {
            d.querySelector('#follow_span').innerHTML = `
            <button data-id="${id}" class="btn btn-sm btn-primary mb-2 follow followed">&#10003; Following</button>
            `;
            d.querySelector('#follow_span').classList.add('followed');
            d.querySelector('.follow').addEventListener('click', () => {follow(id)});
        }        
    });        
}

function fetch_discussion(api) {
    fetch(api)
    .then(response => response.json())
    .then(topic => {
        const slug = topic.slug;
        history.pushState({slug: slug}, "", `#${slug}`);
        document.getElementById('topics').querySelector('h1').innerHTML = `${topic.topic}`;        
        if (topic.discussions.length === 0) {
            document.getElementById('sub-topics').innerHTML = `
            <h5>No topics yet</h5>`;
        }
        topic.discussions.forEach(discussion => {
            create(discussion);
        });
    });
}

function create(discussion) {
    const slug = string_to_slug(discussion.name);
    if (logged_in) {
        if (discussion.followers.includes(request_user)) {
            var follow_button = `
            <span id="follow_span" class="followed">
            <button data-id="${discussion.id}" class="btn btn-sm btn-primary mb-2 follow followed">&#10003; Following</button>
            </span>
        `;    
        } else {
            var follow_button = `            
            <span id="follow_span" class="">
            <button data-id="${discussion.id}" class="btn btn-sm btn-outline-primary follow mb-2">Follow</button>
            </span>
        `;    
        }
    }

    let element = document.createElement('div');
    element.className = "discussion-link container my-1";
    element.id = `discussion-${discussion.id}`;
    element.setAttribute('data-id', `${discussion.id}`);
    element.innerHTML = `
    <a href="/discussion/${discussion.slug}" class="nav-link topic"><h4>${discussion.name}</h4></a>
    <p class="ml-3">Started by ${discussion.user}</p>
    <footer class="text-secondary bottom row mt-3 mr-3 footer">
    <span id="follow-button" class="col-sm-6">
    </span>
    <div class="col-sm-6 timestamp text-right">${discussion.timestamp}</div>
    </footer>
    `;
    element.querySelector('#follow-button').innerHTML = follow_button;
    append(element, "sub-topics")
}

function append(element, div) {
    document.getElementById(`${div}`).append(element);
    element.querySelector('.follow').addEventListener('click', () => {follow(element.dataset.id)});
}