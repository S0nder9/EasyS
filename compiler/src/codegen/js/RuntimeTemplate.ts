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



mount(){

this.render();

}



render(){

const app =
document.getElementById("app");


if(app){

app.innerHTML =
window.EASY_RENDER(this.state);

}


this.bindEvents();

}



bindEvents(){


for(
const element of document.querySelectorAll("[data-action]")
){


element.onclick=()=>{


const action =
element.dataset.action;


if(
this.actions[action]
){

this.actions[action](
this.state
);

}


}


}


}


}


window.EasyRuntime =
new EasyRuntime();

`;
