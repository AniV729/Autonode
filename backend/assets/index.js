async function api(endpoint, body) {
    const res = await fetch('/walker/' + endpoint, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(body||{})
    });
    return res.json();
}

function renderLog(entries) {
    const el = document.getElementById('log'); el.innerHTML = '';
    if(!entries) return;
    entries.slice().reverse().forEach(e=>{
        const d = document.createElement('div'); d.className='log-entry';
        const time = new Date((e.ts||Date.now())*1).toLocaleTimeString();
        d.textContent = `[${time}] ${e.agent||'sys'}: ${e.msg||''}`;
        el.appendChild(d);
    });
}

function renderMap(state) {
    const root = document.getElementById('map-root'); root.innerHTML='';
    const w=1000,h=600;
    const svgNS='http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS,'svg'); svg.setAttribute('width', w); svg.setAttribute('height', h); svg.style.background='#021427';

    (state.zones||[]).forEach(z=>{
        const r = document.createElementNS(svgNS,'rect');
        r.setAttribute('x', z.x); r.setAttribute('y', z.y); r.setAttribute('width', z.w); r.setAttribute('height', z.h);
        r.setAttribute('fill', z.color); r.setAttribute('class','zone'); svg.appendChild(r);
        const t = document.createElementNS(svgNS,'text'); t.setAttribute('x', z.x+6); t.setAttribute('y', z.y+14); t.setAttribute('fill','#fff'); t.setAttribute('font-size','12'); t.textContent = z.name; svg.appendChild(t);
    });

    (state.routers||[]).forEach(rtr=>{
        const g = document.createElementNS(svgNS,'g');
        const c = document.createElementNS(svgNS,'circle'); c.setAttribute('cx', rtr.x); c.setAttribute('cy', rtr.y); c.setAttribute('r', 16); c.setAttribute('fill','#1e293b');
        g.appendChild(c);
        const t = document.createElementNS(svgNS,'text'); t.setAttribute('x', rtr.x); t.setAttribute('y', rtr.y+4); t.setAttribute('fill','#fff'); t.setAttribute('font-size','10'); t.setAttribute('text-anchor','middle'); t.textContent = rtr.router_id || rtr.id || '';
        g.appendChild(t);
        svg.appendChild(g);
    });

    (state.sensors||[]).forEach(s=>{
        const g = document.createElementNS(svgNS,'g'); g.setAttribute('class','sensor');
        const c = document.createElementNS(svgNS,'circle'); c.setAttribute('cx', s.x); c.setAttribute('cy', s.y); c.setAttribute('r', 8);
        c.setAttribute('fill', s.status==='online' ? '#22c55e' : '#ef4444'); g.appendChild(c);
        const t = document.createElementNS(svgNS,'text'); t.setAttribute('x', s.x); t.setAttribute('y', s.y+18); t.setAttribute('fill','#fff'); t.setAttribute('font-size','9'); t.setAttribute('text-anchor','middle'); t.textContent = s.id;
        g.appendChild(t);
        svg.appendChild(g);
    });

    root.appendChild(svg);
}

async function refresh() {
    try {
        const state = await api('api_state');
        renderMap(state);
        renderLog([]);
    } catch(e) { console.error(e); }
}

document.getElementById('btn-refresh').addEventListener('click', refresh);
document.getElementById('btn-reset').addEventListener('click', async ()=>{ await api('api_reset',{}); await refresh(); });

// auto refresh on load
refresh();
