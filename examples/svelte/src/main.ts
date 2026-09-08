import { mount } from "svelte";
import App from "./App.svelte";

import "@chaos_team/blbui-core/styles.css";

mount(App, { target: document.getElementById("app")! });
