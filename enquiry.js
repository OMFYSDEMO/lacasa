document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent || submitBtn.value : '';

    if (submitBtn) {
      submitBtn.disabled = true;
      if (submitBtn.tagName === 'BUTTON') {
        submitBtn.textContent = 'Sending...';
      } else {
        submitBtn.value = 'Sending...';
      }
    }

    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        form.innerHTML = `
          <div style="text-align:center;padding:40px 20px">
            <div style="font-family:'Cormorant Garamond',ser
