document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('enquiry-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var btn = form.querySelector(
      'button[type="submit"],input[type="submit"]'
    );
    var orig = btn ? btn.textContent || btn.value : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending...';
      btn.value = 'Sending...';
    }
    var fd = new FormData(form);
    var data = {};
    fd.forEach(function(v, k) { data[k] = v; });
    try {
      var res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      var result = await res.json();
      if (result.success) {
        form.innerHTML = '<div style="text-align:center;' +
          'padding:40px 20px"><div style="font-family:' +
          'Cormorant Garamond,serif;font-size:32px;' +
          'color:#3a3128;margin-bottom:12px">' +
          'Thank you</div><p style="font-size:16px;' +
          'line-height:1.7;color:#6b5f51;max-width:' +
          '400px;margin:0 auto">Your enquiry has been ' +
          'received. The hosts will get back to you ' +
          'personally.</p></div>';
      } else {
        alert(result.error || 'Please try again.');
        if (btn) { btn.disabled = false; btn.textContent = orig; }
      }
    } catch (err) {
      alert('Please call or WhatsApp +91 97469 98998.');
      if (btn) { btn.disabled = false; btn.textContent = orig; }
    }
  });
});
