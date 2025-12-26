const foods = window.FOODS_DB;
const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const el = id => document.getElementById(id);

let goal = +localStorage.getItem("goal") || 2000;
let selectedDay = localStorage.getItem("selectedDay") || "Mon";
let state = JSON.parse(localStorage.getItem("data")) || {};

days.forEach(d => state[d] ||= { meals: [] });
el("goalText").innerText = goal;

days.forEach(d => el("day").innerHTML += `<option>${d}</option>`);
el("day").value = selectedDay;

function save() {
  localStorage.setItem("data", JSON.stringify(state));
  localStorage.setItem("selectedDay", selectedDay);
}

function totals(d) {
  return state[d].meals.reduce((t,m)=>({
    cal:t.cal+m.cal, p:t.p+m.p, f:t.f+m.f, c:t.c+m.c
  }),{cal:0,p:0,f:0,c:0});
}

function renderFoods(filter="") {
  el("food").innerHTML = "";
  Object.keys(foods)
    .filter(f => f.toLowerCase().includes(filter))
    .forEach(f => el("food").innerHTML += `<option>${f}</option>`);
}

function fillFood() {
  const f = foods[el("food").value];
  if (!f) return;
  const m = f.unit === "100g" ? +el("portion").value : 1;

  el("cal").value = Math.round(f.cal * m);
  el("p").value = (f.p * m).toFixed(1);
  el("f").value = (f.f * m).toFixed(1);
  el("c").value = (f.c * m).toFixed(1);
  el("info").innerText = `Nutrition per ${f.unit}`;
}

function render() {
  const t = totals(selectedDay);

  el("calories").innerText = t.cal;
  el("protein").innerText = t.p.toFixed(1);
  el("fat").innerText = t.f.toFixed(1);
  el("carbs").innerText = t.c.toFixed(1);
  el("calBar").style.width = Math.min(t.cal/goal*100,100)+"%";

  el("table").innerHTML = "";
  state[selectedDay].meals.forEach((m,i)=>{
    el("table").innerHTML += `
      <tr>
        <td>${m.meal}</td><td>${m.food}</td><td>${m.portion}</td>
        <td>${m.cal}</td><td>${m.p}</td><td>${m.f}</td><td>${m.c}</td>
        <td><button onclick="del(${i})">X</button></td>
      </tr>`;
  });

  el("week").innerHTML = "";
  days.forEach(d => {
    el("week").innerHTML += `<div class="day">${d}<br>${totals(d).cal}</div>`;
  });
}

function del(i) {
  state[selectedDay].meals.splice(i,1);
  save(); render();
}

/* EVENTS */
el("search").oninput = e => renderFoods(e.target.value.toLowerCase());
el("food").onchange = fillFood;
el("portion").onchange = fillFood;

el("addBtn").onclick = () => {
  state[selectedDay].meals.push({
    meal: el("meal").value,
    food: el("food").value,
    portion: el("portion").options[el("portion").selectedIndex].text,
    cal:+el("cal").value||0,
    p:+el("p").value||0,
    f:+el("f").value||0,
    c:+el("c").value||0
  });
  save(); render();
};

el("clearBtn").onclick = () => {
  if(confirm("Clear this day?")) {
    state[selectedDay].meals = [];
    save(); render();
  }
};

el("day").onchange = () => {
  selectedDay = el("day").value;
  save(); render();
};

/* GOAL */
el("goalBtn").onclick = () => el("modal").style.display = "block";
el("closeGoal").onclick = () => el("modal").style.display = "none";
el("applyGoal").onclick = () => {
  goal = +el("maint").value - 500;
  localStorage.setItem("goal", goal);
  el("goalText").innerText = goal;
  el("modal").style.display = "none";
  render();
};

/* INIT */
renderFoods();
fillFood();
render();
