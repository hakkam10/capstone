document.addEventListener('DOMContentLoaded', function() {
    console.log(id);
    openNav();
    argument();
    fetch_arguments();
    button();
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
            element.id = `id-${argument.id}`
            element.setAttribute('data-id', `${argument.id}`)
            element.className = `col-9 ${argument.side} mt-1`
            element.innerHTML = `
                <h5>${argument.user}</h5>
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

function button() {
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
        });
    });
}