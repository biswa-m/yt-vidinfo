import React, { Component } from "react";
import axios from "axios";
import ScriptTag from "react-script-tag";

import "./App.css";

const LINKS_PER_BATCH = 50;
const YT_API_KEY = process.env.REACT_APP_YT_API_KEY;
var loading = false;

class App extends Component {
  state = {
    results: [],
    hideDesc: false,
    hideTags: false,
  };

  async handleSubmit(e) {
    e.preventDefault();
    let data = await handleSubmit();
    console.log({ data });

    if (data.tableData && data.ids) {
      let results = data.ids?.map((id) => {
        let matched = data.tableData?.find((x) => x?.id === id) || {};
        return { ...matched, id };
      });

      this.setState({ results });
    }
  }

  render() {
    if (window.location.hostname === 'techlabdelta.com') {
      window.location = '//yt.techlabdelta.com';
      return <div>Redirecting...</div>
    };

    return (
      <>
        <ScriptTag
          type="text/javascript"
          src="//servedby.eleavers.com/ads/ads.php?t=MjI3OTg7MTM3NTA7aG9yaXpvbnRhbC5sZWFkZXJib2FyZA==&index=1"
        />

        <div className="header">
          <img
            alt="logo"
            src={require("./assets/img/logo.png")}
            className="logo"
          />

          <div className="right">
            <a target="_blank" href="//github.com/biswa-m">
              <img alt="git" src={require("./assets/img/github.png")} />
            </a>
            <a target="_blank" href="mailto:bis.mhnta@gmail.com">
              <img alt="git" src={require("./assets/img/email.png")} />
            </a>
          </div>
        </div>

        <div className="row" style={{ padding: "10 5%" }}>
          <div className="form__group cust1">
            <label htmlFor="inputIds" className="form__label">
              Youtube Ids
            </label>
            <br />
            <textarea
              type="text"
              className="form__input linkinput"
              id="inputIds"
              placeholder="Youtube Ids"
              required=""
            ></textarea>

            <div onClick={this.handleSubmit.bind(this)} className="submitbtn">
              Submit
            </div>
          </div>

          <div className="form__group">
            <div htmlFor="name" className="form__label">
              Result
              <div
                style={{ textAlign: "right", padding: "5px", float: "right" }}
              >
                <button
                  onClick={() =>
                    selectElementContents(document.getElementById("tbody"))
                  }
                >
                  Copy Content
                </button>
              </div>
            </div>
            <br />

            <div className="centerify" id="loader1" style={{ display: "none" }}>
              <div className="loader"></div>
            </div>
            <div id="yt_results">
              <table style={{ width: "-webkit-fill-available" }}>
                <tbody id="tbody1">
                  <tr>
                    <th>calculated</th>
                    <th>id</th>
                    <th>original</th>
                    <th>title</th>
                    <th>
                      description{" "}
                      <input
                        type="checkbox"
                        checked={!this.state.hideDesc}
                        onChange={() =>
                          this.setState({
                            hideDesc: !this.state.hideDesc,
                          })
                        }
                      />
                    </th>
                    <th>
                      tags{" "}
                      <input
                        type="checkbox"
                        checked={!this.state.hideTags}
                        onChange={() =>
                          this.setState({
                            hideTags: !this.state.hideTags,
                          })
                        }
                      />
                    </th>
                  </tr>
                </tbody>
                <tbody id="tbody">
                  {this.state.results?.map((item) => (
                    <tr
                      className={
                        !item?.title || !item.duration ? "noContent" : ""
                      }
                    >
                      <td>{item.duration}</td>
                      <td>{item.id}</td>
                      <td>{item.durationOriginal}</td>
                      <td>{item.title}</td>
                      <td>{this.state.hideDesc ? "" : item.description}</td>
                      <td>{this.state.hideTags ? "" : item.tags}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  }
}

async function handleSubmit() {
  if (loading) return;

  var idsEl = document.getElementById("inputIds");
  var str = idsEl.value;

  if (!str) return;

  let ids = str
    .replace(/\n/g, ",")
    .split(",")
    .map((x) => {
      if (!x) return null;
      x = x.trim();
      x = x.replace("https://youtu.be/", "");
      x = x.replace(/\//g, "");
      return x;
    })
    .filter((x) => !!x);

  let batches = [];
  let tmp = [];

  console.log({ ids });
  for (let i = 0; i < ids.length; i++) {
    const link = ids[i];
    tmp.push(link);

    if (tmp.length >= LINKS_PER_BATCH || i === ids.length - 1) {
      batches.push(tmp);
      tmp = [];
    }
  }

  console.log(batches);
  loading = true;
  setLoading();

  let results = [];

  try {
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      const url =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=contentDetails,snippet&key=${YT_API_KEY}&id=${batch.join()}`;

      let res = await axios.get(url);

      let batchItems = res.data.items;
      results.push(...batchItems);

      console.log(`Batch loaded ${i}/${batches.length}`);
      console.log({ res, batchItems, results });
    }

    loading = false;
    resetLoading();

    // let resEl = document.getElementById("yt_results");

    // resEl.textContent = JSON.stringify(results);

    let tableData = results.map((row) => ({
      duration: processedDuration(row.contentDetails.duration),
      id: row.id,
      durationOriginal: row.contentDetails.duration,
      title: row.snippet.title,
      description: row.snippet.description,
      tags: (row.snippet.tags && row.snippet.tags.join(", ")) || "",
    }));

    // tableCreate(tableData);
    return { tableData, ids };
  } catch (e) {
    console.warn(e);
    loading = false;
    resetLoading();
  }

  results = [];
}

function setLoading() {
  var x = document.getElementById("loader1");
  var y = document.getElementById("yt_results");
  x.style.display = "flex";
  y.style.display = "none";
}

function resetLoading() {
  var x = document.getElementById("loader1");
  var y = document.getElementById("yt_results");
  x.style.display = "none";
  y.style.display = "block";
}

function tableCreate(data) {
  // data = [
  //   [1, 2, 3],
  //   [1, 2, 3],
  //   [5, 6, 7],
  // ];

  var tbdy = document.getElementById("tbody");
  removeAllChildNodes(tbdy);

  for (var i = 0; i < data.length; i++) {
    var row = data[i];

    var tr = document.createElement("tr");
    for (var j = 0; j < row.length; j++) {
      var td = document.createElement("td");
      td.appendChild(document.createTextNode(row[j]));
      tr.appendChild(td);
    }
    tbdy.appendChild(tr);
  }
}

function processedDuration(d) {
  //PT4M53S
  let d1 = d.match("H")
    ? d.replace("PT", "")
    : d.match("M")
    ? d.replace("PT", "00:")
    : d.replace("PT", "00:00:");

  let d2 = d1.replace("H", ":").replace("M", ":").replace("S", "");
  let d3 = d2
    .split(":")
    .map((x) => (x.length === 0 ? "00" : x.length === 1 ? "0" + x : x))
    .join(":");

  return d3;
}

function selectElementContents(el) {
  var body = document.body,
    range,
    sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }
  } else if (body.createTextRange) {
    range = body.createTextRange();
    range.moveToElementText(el);
    range.select();
    document.execCommand("copy");
  }
  document.execCommand("copy");
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

export default App;
