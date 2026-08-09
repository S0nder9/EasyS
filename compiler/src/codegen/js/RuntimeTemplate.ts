export const RuntimeTemplate = `

class EasyRuntime {

constructor(){
this.state = {};
this.actions = {};
}

setState(key,value){
this.state[key]=value;
this.render();
}

navigate(route){
history.pushState({}, "", route);
this.render();
}

mount(){
document.addEventListener("click", (e)=>{
const target = e.target && e.target.closest ? e.target.closest("[data-easys-link]") : null;
if(!target) return;
e.preventDefault();
const route = target.getAttribute("data-easys-link");
if(route) this.navigate(route);
});

window.addEventListener("popstate", ()=>{
this.render();
});

this.render();
}

render(){
const app = document.getElementById("app");
if(!app) return;

const path = window.location.pathname || "/";
const routes = window.EasyRoutes || {};
const pageRender = routes[path] || routes["/"] || window.EASY_RENDER;

if(typeof pageRender === "function"){
app.innerHTML = pageRender(this.state);
} else if(typeof pageRender === "string"){
app.innerHTML = pageRender;
}

this.bindEvents();
}

bindEvents(){
for(const element of document.querySelectorAll("[data-action]")){
element.onclick=()=>{
const action = element.dataset.action;
if(this.actions[action]){
this.actions[action](this.state);
this.render();
}
};
}
}

}

window.EasyRuntime = new EasyRuntime();

`;
