document.querySelectorAll('.thumbnail-container').forEach(item => {
    item.addEventListener('click', event => {
      const thumbnail = item.querySelector('.thumbnail');
      const filename = item.querySelector('.filename');

      document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.classList.remove('selected'); // Remove selection from all thumbnails
      });
      document.querySelectorAll('.filename').forEach(filenam => {
        filenam.classList.remove('selected'); // Remove selection from all thumbnails
      });
      thumbnail.classList.add('selected'); // Highlight the clicked thumbnail
      filename.classList.add('selected');
      const previewPane = document.getElementById('preview-pane');
      previewPane.style.display = 'block'; // Show the preview pane
      previewPane.innerHTML = `<img src="${thumbnail.src}" alt="${thumbnail.alt}" style="width: 100%;">` + 
                              `<div style="text-align: center; margin-top: 5px;">${thumbnail.alt}</div>`; // Display the clicked image and filename
    });
  });