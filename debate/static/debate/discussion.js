document.addEventListener('DOMContentLoaded', function() {
    console.log(id);
    openNav();
    argument();
    fetch_arguments();
    follow();
    document.getElementById(`${topic}`).querySelector('a').classList.add("active");
})

function openNav() {
    if (document.getElementById("mySidepanel").style.width === "0px") {
        document.getElementById("mySidepanel").style.width = "250px";
    } else {    
        document.getElementById("mySidepanel").style.width = "0";
    }
}

function argument() {

    document.querySelector('#post').onsubmit = () => {
        document.querySelector('#argument_error').innerHTML = "";
        const argument = document.getElementById('post').querySelector('#argument').value;
        const side = document.getElementById('post').querySelector('#side').value;    
        console.log(argument, side);
        fetch(`/argument/${id}`, {
            method: 'POST',
            body: JSON.stringify({
                argument: argument,
                side: side,
            })
        })
        .then(response => response.json())
        .then(message => {
            console.log(message);
            if (message.message == "success") {
                document.getElementById('post').querySelector('#argument').value = "";
                document.getElementById('post').querySelector('#side').value = "";
                fetch_arguments();
                document.querySelector('#argument-count').innerHTML = parseInt(document.querySelector('#argument-count').innerHTML) + 1;
            } 
            if (message[0]) {
            if (message[0].argument) {
                document.querySelector('#argument_error').innerHTML = "Argument cannot be blank";}
            if (message[0].side) {
                document.querySelector('#argument_error').innerHTML = "Select a side";}
            }    
            
        });
        return false;
    }
}

function fetch_arguments() {
    let panel = document.getElementById('fetch-arguments');
    panel.innerHTML = "";
    fetch(`/argument/${id}`)
    .then(response => response.json())
    .then(arguments => {
        console.log(arguments);
        arguments.forEach(argument => {
            if (argument.likers.includes(request_user)) {
                var span = `<span class="heart liked"><i class="fa fa-heart"></i></span> <span class="like">${argument.likers.length}</span>`;
            } else {
                var span = `<span class="heart"><i class="fa fa-heart-o"></i></span> <span class="like">${argument.likers.length}</span>`;
            }
            let element = document.createElement('div');
            element.id = `${argument.user}`
            element.setAttribute('data-id', `${argument.id}`)
            element.className = `col-9 ${argument.side} mt-1`
            element.innerHTML = `
                <h5><a style="text-decoration:none; color:black;" href="/profile/${argument.user}">${argument.user}</a></h5>
                ${argument.argument}
                <footer class="mt-2">
                <p>${span}</p>
                </footer>
            `
            panel.append(element);
            if (logged_in) {
                element.querySelector('.heart').addEventListener('click', () => {console.log("clicked");like(element);});
            }
        });
    });
}

function like(element) {
    if (element.querySelector('.heart').classList.contains('liked')) {
        element.querySelector('.heart').innerHTML = `<i class="fa fa-heart-o"></i>`;
        element.querySelector('.heart').classList.remove('liked');
        let num = element.querySelector('.like').innerHTML;
        num--;
        element.querySelector('.like').innerHTML = num;
    } else {
        element.querySelector('.heart').innerHTML = `<i class="fa fa-heart"></i>`;
        element.querySelector('.heart').classList.add('liked');
        let num = element.querySelector('.like').innerHTML;
        num++;
        element.querySelector('.like').innerHTML = num;
    }        

    fetch(`/like/${element.dataset.id}`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        // Continue server side updating of likes
        console.log(result.message);
    });

}

function follow() {
    let follow = document.querySelector('#follow-input')
    follow.addEventListener('click', () => {
        if (follow.classList.contains('followed')) {
            follow.classList.remove('followed');
            follow.innerHTML = `<input type="button" value="Follow" class="btn btn-outline-primary"/>`
        } else {
            follow.classList.add('followed');
            follow.innerHTML = `<input type="button" value="&#10003; Following" class="btn btn-primary"/>`
        }     

        fetch(`/argument/${id}`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(result => {
            if (result.message === "created") {
                document.querySelector('#follower-count').innerHTML = parseInt(document.querySelector('#follower-count').innerHTML) + 1;
            } else {
                document.querySelector('#follower-count').innerHTML = parseInt(document.querySelector('#follower-count').innerHTML) - 1;
            }
        });
    });
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

