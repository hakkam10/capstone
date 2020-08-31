const user = window.location.pathname.replace("/profile/", ""); 
document.addEventListener('DOMContentLoaded', function() {
    fetch_discussion(`/user/${user}`);
    if (request_user != user) {
        follow_user();
    }
})


function fetch_discussion(api) {
    fetch(api)
    .then(response => response.json())
    .then(sections => {
        console.log(sections[0].length)
        
        sections[0].forEach(discussion => {
            create(discussion, "started-by");
        });
        sections[1].forEach(discussion => {
            create(discussion, "participated-in");
        });
        var i;
        for (i = 0; i <= 1; i++) {
            if (sections[i].length === 0) {
                document.getElementById(`empty-${i}`).innerHTML = "No discussions yet";
            }
        }
        
    })
}

function openNav() {
    if (document.getElementById("mySidepanel").style.width === "0px") {
        document.getElementById("mySidepanel").style.width = "250px";
    } else {    
        document.getElementById("mySidepanel").style.width = "0";
    }
  }


function create(discussion, div) {
    if (logged_in) {
        if (discussion.followers.includes(request_user)) {
            var follow_button = `
            <span id="follow_span" class="followed">
            <button data-id="${discussion.id}" class="btn btn-sm btn-outline-primary active mb-2 follow followed">&#10003; Following</button>
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

function follow_user() {
    let follow = document.querySelector('#follow-input')
    follow.addEventListener('click', () => {
        if (follow.classList.contains('followed')) {
            follow.classList.remove('followed');
            follow.innerHTML = `<input type="button" value="Follow" class="btn btn-outline-primary"/>`
        } else {
            follow.classList.add('followed');
            follow.innerHTML = `<input type="button" value="&#10003; Following" class="btn btn-primary"/>`
        }     

        fetch(`/user/${user}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(result => {
            console.log(result)
            if (result.message === "created") {
                document.querySelector('#follower-count').innerHTML = parseInt(document.querySelector('#follower-count').innerHTML) + 1;
            } else {
                document.querySelector('#follower-count').innerHTML = parseInt(document.querySelector('#follower-count').innerHTML) - 1;
            }
        });
    });
}

function follow(id) {
    let d = document.getElementById(`discussion-${id}`);
    d.querySelector('.btn').classList.toggle('active');
    fetch(`/argument/${id}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result.message);
        if (d.querySelector('#follow_span').classList.contains('followed')) {
            d.querySelector('#follow_span').classList.remove('followed');
            d.querySelector('.btn').innerHTML = "Follow";
        } else {
            d.querySelector('#follow_span').classList.add('followed');
            d.querySelector('.btn').innerHTML = "&#10003; Following";
        }        
    });        
}
