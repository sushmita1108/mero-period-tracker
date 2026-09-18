const storedPhoto = localStorage.getItem('mero-cycle-profile-photo');
const photoPreview = document.querySelector('#profile-photo-preview');
const photoInput = document.querySelector('#profile-photo');
const removePhotoButton = document.querySelector('#remove-profile-photo');

function applyStoredPhoto() {
    document.querySelectorAll('.profile-avatar-photo').forEach((photo) => {
        if (storedPhoto) {
            photo.src = storedPhoto;
            photo.hidden = false;
            photo.previousElementSibling.hidden = true;
        }
    });
    if (photoPreview && storedPhoto) {
        photoPreview.src = storedPhoto;
        photoPreview.hidden = false;
        photoPreview.previousElementSibling.hidden = true;
    }
}

applyStoredPhoto();

if (photoInput) {
    photoInput.addEventListener('change', () => {
        const [file] = photoInput.files;
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            localStorage.setItem('mero-cycle-profile-photo', reader.result);
            if (photoPreview) {
                photoPreview.src = reader.result;
                photoPreview.hidden = false;
                photoPreview.previousElementSibling.hidden = true;
            }
        });
        reader.readAsDataURL(file);
    });
}

if (removePhotoButton) {
    removePhotoButton.addEventListener('click', () => {
        localStorage.removeItem('mero-cycle-profile-photo');
        if (photoPreview) {
            photoPreview.removeAttribute('src');
            photoPreview.hidden = true;
            photoPreview.previousElementSibling.hidden = false;
        }
        document.querySelectorAll('.profile-avatar-photo').forEach((photo) => {
            photo.removeAttribute('src');
            photo.hidden = true;
            photo.previousElementSibling.hidden = false;
        });
    });
}
