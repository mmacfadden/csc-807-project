import {Persistence} from "./Persistence.js";
import {download_file} from "./download_utils.js";

export default {
  props: [],
  events: ["reset", "error"],

  mounted() {
    this.$refs.importFile.onchange = (evt)  => {
      const reader = new FileReader();

      reader.onload = (evt) => {
        if (evt.target.readyState !== 2) return;
        if (evt.target.error) {
          alert('Error while reading file');
          return;
        }

        const content = evt.target.result;
        try {
          const config = JSON.parse(content);
          Persistence.saveTestConfig(config);

        } catch (e) {
          // TODO pop an error
        }
      };

      reader.readAsText(evt.target.files[0]);
    }
  },
  methods: {
    reset() {
      Persistence.reset();
      this.$emit("reset");
    },
    exportSettings() {
      const settings = Persistence.loadTestConfig();
      const settingsJson = JSON.stringify(settings, null, "  ");
      download_file("load-test-settings.json", settingsJson);
    }
  },
  template: `
    <div class="d-flex flex-fill flex-column">
      <h1><i class="fa-solid fa-gears"/> Settings</h1>
      <div class="row gy-3">
        <div class="col-md-4 col-sm-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Export Settings</h5>
              <p class="card-text">
                Reset all setting to their default values. Warning, this will discard any changes.
                Please export settings prior to resetting them if you wish to save them.
              </p>
              <div class="text-end">
                <button class="btn btn-primary" @click="exportSettings">
                  <i class="fa-solid fa-download"/> Export Settings
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-sm-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Import Settings</h5>
              <p class="card-text">
                Reset all setting to their default values. Warning, this will discard any changes.
                Please export settings prior to resetting them if you wish to save them.
              </p>
              <div class="text-end">
                <input class="form-control" type="file" id="importFile" ref="importFile">
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 col-sm-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Reset All Settings</h5>
              <p class="card-text">
                Reset all setting to their default values. Warning, this will discard any changes.
                Please export settings prior to resetting them if you wish to save them.
              </p>
              <div class="text-end">
                <button class="btn btn-danger" @click="reset">
                  <i class="fa-solid fa-refresh"/> Reset Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}