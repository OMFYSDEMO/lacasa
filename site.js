const form = document.querySelector('#enquiry-form');
if (form) {
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button');
  const arrival = form.elements.arrival;
  const departure = form.elements.departure;
  const today = new Date();
  const localDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  arrival.min = localDate(today);
  arrival.addEventListener('change', () => {
    if (!arrival.value) return;
    const next = new Date(arrival.value + 'T12:00:00');
    next.setDate(next.getDate()+1);
    departure.min = localDate(next);
    departure.setCustomValidity(departure.value && departure.value <= arrival.value ? 'Departure must be after arrival.' : '');
  });
  departure.addEventListener('change', () => departure.setCustomValidity(departure.value <= arrival.value ? 'Departure must be after arrival.' : ''));
  async function prepare() {
    try {
      const response = await fetch('csrf.php', {cache:'no-store', credentials:'same-origin'});
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error();
      form.elements.csrf.value = data.token;
      button.disabled = false;
      status.textContent = '';
    } catch {
      status.textContent = 'The form is unavailable. Please call +91 97469 98998 or WhatsApp the hosts.';
    }
  }
  prepare();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    status.textContent = 'Sending your enquiry…';
    try {
      const response = await fetch(form.action, {method:'POST', body:new FormData(form), credentials:'same-origin'});
      const data = await response.json();
      status.textContent = data.message;
      if (response.ok) { form.reset(); await prepare(); status.textContent = data.message; }
    } catch {
      status.textContent = 'We could not confirm delivery. Please call or WhatsApp the hosts before trying again.';
    } finally { button.disabled = !form.elements.csrf.value; }
  });
}
