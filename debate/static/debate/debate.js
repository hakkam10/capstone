document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#home').style.display = 'block';
    document.querySelector('#topics').style.display = 'none';
    document.querySelectorAll('.links').forEach(link => {
        link.addEventListener('click', () => {
            topics();
            link.querySelector('span').classList.add('active');        
        });
        link.style.cursor = 'pointer';
    });
})

function topics() {
    document.querySelector('#topics').style.display = 'block';
    document.querySelector('#home').style.display = 'none';

}

function discussion() {
    document.querySelector('#topics').style.display = 'none';
    document.querySelector('#home').style.display = 'none';
}