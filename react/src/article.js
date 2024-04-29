import React from 'react';

import ReactDOM from 'react-dom/client';
import "./style.css";
import "./common.css";
import { data_link } from "./navigation/links.js";

import { ArticlePanel } from './components/article-panel';
import { loadProtobuf } from './load_json';
import { remove_universe_if_not_in } from './universe.js';


async function loadPage() {
    const window_info = new URLSearchParams(window.location.search);

    const longname = window_info.get("longname");
    const data = await loadProtobuf(data_link(longname), "Article");
    document.title = data.shortname;
    const root = ReactDOM.createRoot(document.getElementById("root"));
    remove_universe_if_not_in(data.universes)
    root.render(<ArticlePanel longname={longname} {...data} />);
}

loadPage();