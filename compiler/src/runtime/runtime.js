class EasyRuntime {
  constructor() {
    this.state = {};

    this.actions = {};
  }

  mount() {
    this.render();
  }

  render() {
    const app = document.getElementById("app");

    app.innerHTML = window.EASY_RENDER(this.state);

    this.bind();
  }

  bind() {
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.onclick = () => {
        this.actions[btn.dataset.action](this.state);

        this.render();
      };
    });
  }
}

window.EasyRuntime = new EasyRuntime();
