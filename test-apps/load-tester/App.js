
import {Persistence} from "./Persistence.js";

export default {
  template: `
    <nav class="navbar navbar-expand navbar-dark bg-dark">
    <div class="container-fluid">
      <span class="navbar-brand">
        <i class="fa-brands fa-html5"></i>
        <i class="fa-solid fa-database"></i>
        <span>Encrypted IndexedDB Load Test Tool</span>
      </span>
      <div class="flex-fill"></div>
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link" to="/">Test</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/schemas">Schemas</router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" target="_blank" href="https://github.com/mmacfadden/csc-807-project">
            <i class="fa-brands fa-github"></i>
            GitHub
          </a>
        </li>
      </ul>
    </div>
    </nav>
    <div class="d-flex flex-fill flex-column" id="main">
      <router-view></router-view>
    </div>
  `
}