document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.links').forEach(link => {
            link.querySelector('span').addEventListener('click', () => {
                const slug = link.dataset.slug;
                topics();
                document.getElementById("mySidepanel").style.width = "0";
                fetch_discussion(`/topic/${slug}`);
                new_discussion(slug);
                history.pushState({slug: slug}, "", `#${slug}`);
        });
    });
    openNav();
    if (window.location.hash != "") {
        let hash = window.location.hash;
        const slug = hash.replace(hash.charAt(0), "");
        topics();
        fetch_discussion(`/topic/${slug}`);
        new_discussion(slug);
    } else {
        document.querySelector('#topics').style.display = 'none';
        document.querySelector('#home').style.display = 'block';
        homepage();    
    }
});

window.onpopstate = function(event) {
    console.log(event.state);
    if (event.state != null) {
        topics();
        fetch_discussion(`/topic/${event.state.slug}`);
        new_discussion(event.state.slug);
    } else {
        document.querySelector('#topics').style.display = 'none';
        document.querySelector('#home').style.display = 'block'; 
        homepage();   
    }
}


function topics() {
    document.querySelector('#topics').style.display = 'block';
    document.querySelector('#home').style.display = 'none';
    document.querySelectorAll('.links').forEach(link => {link.querySelector('span').classList.remove('active')});
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
    var content = document.getElementById('new-discussion');
    document.querySelector("#new-discussion-button").classList.toggle('active');
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
}

function new_discussion(slug) {
    let new_discussion = document.getElementById('new-discussion');
    new_discussion.querySelector('#new-discussion-form').onsubmit = () => {
        document.querySelector('#message').innerHTML = "";
        document.querySelector('#argument-error').innerHTML = "";
        document.querySelector('#name-error').innerHTML = "";
        const name = new_discussion.querySelector('#new-subtopic').value;
        const argument = new_discussion.querySelector('#OA').value;
        fetch(`/topic/${slug}`, {
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
                topics();
                fetch_discussion(`/topic/${slug}`);
            }
            if (message.does_not_exist) {
                document.querySelector('#message').innerHTML = `${message.does_not_exist}`;
            }
            if (message[0]) {
                if (message[0].opening_argument) {
                document.querySelector('#argument-error').innerHTML = `${message[0].opening_argument}`;
                new_discussion.style.maxHeight = new_discussion.scrollHeight + "px";
                } if (message[0].name) {
                document.querySelector('#name-error').innerHTML = `${message[0].name}`;
                new_discussion.style.maxHeight = new_discussion.scrollHeight + "px";
                } if (message[0].slug) {
                document.querySelector('#name-error').innerHTML = "Discussion already exists.";
                new_discussion.style.maxHeight = new_discussion.scrollHeight + "px";
                }
            } 
        });
        return false
    }
}

function follow(id) {
    fetch(`/argument/${id}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result.message);
        document.querySelectorAll(`.discussion-${id}`).forEach(d => {
            d.querySelector('.btn').classList.toggle('active');
            d.querySelector('#follow_span').classList.toggle('followed');
            if (d.querySelector('#follow_span').classList.contains('followed')) {
                d.querySelector('.btn').innerHTML = "&#10003; Following";
            } else {
                d.querySelector('.btn').innerHTML = "Follow";
            }        
        });
    });        
}

function fetch_discussion(api) {
    fetch(api)
    .then(response => response.json())
    .then(topic => {
        if (topic.message) {
            document.getElementById('topics').style.display = 'none';
            document.getElementById('not-found').innerHTML = `${topic.message}`;
        } else {
            const slug = topic.slug;
            document.getElementById(`${topic.id}`).querySelector('span').classList.add('active');
            document.getElementById('topics').querySelector('h1').innerHTML = `${topic.topic}`;        
            if (topic.discussions.length === 0) {
                document.getElementById('sub-topics').innerHTML = `
                <h5 class="ml-4">No topics yet</h5>`;
            }
            topic.discussions.forEach(discussion => {
                create(discussion, "sub-topics");
            });
        }
    });
}

function create(discussion, div) {
    if (logged_in) {
        if (discussion.followers.includes(request_user)) {
            var follow_button = `
            <span id="follow_span" class="followed">
            <button data-id="${discussion.id}" class="btn btn-sm btn-outline-primary active mb-2 follow">&#10003; Following</button>
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
    element.className = `discussion-link container my-1 discussion-${discussion.id}`;
    element.setAttribute('data-id', `${discussion.id}`);
    element.innerHTML = `
    <span id="follow-button" class="float-right mt-3">
    </span>
    <a href="/discussion/${discussion.slug}" class="nav-link topic"><h4>${discussion.name}</h4></a>
    <p class="ml-3">Started by <a href="/profile/${discussion.user}" >${discussion.user}</a></p>
    <footer class="text-secondary bottom mt-3 mr-3 footer">
    <div class="timestamp text-right">${discussion.timestamp}</div>
    </footer>
    `;
    element.querySelector('#follow-button').innerHTML = follow_button;
    append(element, div);
}

function append(element, div) {
    document.getElementById(`${div}`).append(element);
    element.querySelector('.follow').addEventListener('click', () => {follow(element.dataset.id)});
}

function homepage() {
    document.querySelectorAll('.links').forEach(link => {
        link.querySelector('span').classList.remove("active");
    });
    fetch(`homepage`)
    .then(response => response.json())
    .then(sections => {
        console.log(sections)
        var i;
        for (i = 0; i <= 3; i++) {
            if (sections[i].length === 0) {
                document.getElementById(`empty-${i}`).innerHTML = "No discussions yet";
            }
        }
        sections[0].forEach(discussion => {
            create(discussion, "D-following");
        });
        sections[1].forEach(discussion => {
            create(discussion, "User-started");
        })
        sections[2].forEach(discussion => {
            create(discussion, "User-participated");
        })
        sections[3].forEach(discussion => {
            create(discussion, "N-discussions");
        });
    })
}

function search(query) {
    console.log(query);
    document.querySelector('.dropdown-menu').innerHTML = "";
    if (query.length >= 1) {
    fetch(`/search?query=${query}`)
    .then(response => response.json())
    .then(results => {
            document.querySelector('.dropdown-menu').style.display = "block";
            console.log(results);
            results.forEach(result => {
                var element = document.createElement('a');
                element.className = "dropdown-item text-black p-1 border-bottom";
                element.href = `/discussion/${result.slug}`;
                element.innerHTML = result.name;
                document.querySelector('.dropdown-menu').append(element);
            })
        })
        .catch(error => {
            console.log(error);
        })
    } else {
        document.querySelector('.dropdown-menu').style.display = "none";
    }
}