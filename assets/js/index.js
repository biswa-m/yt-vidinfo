const LINKS_PER_BATCH = 2;
var loading = false;

function handleSubmit() {
  if (loading) return;

  var idsEl = document.getElementById("inputIds");
  var str = idsEl.value;

  if (!str) return;

  ids = str
    .replace(/\n/g, ",")
    .split(",")
    .map((x) => x && x.trim())
    .filter((x) => !!x);

  let batches = [];
  let tmp = [];

  console.log({ ids });
  for (let i = 0; i < ids.length; i++) {
    const link = ids[i];
    tmp.push(link);

    if (tmp.length >= LINKS_PER_BATCH || i == ids.length - 1) {
      batches.push(tmp);
      tmp = [];
    }
  }

  console.log(batches);
  loading = true;
  setLoading();

  let batchLoaded = 0;
  let results = [];

  try {
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      const Http = new XMLHttpRequest();
      const url =
        `https://www.googleapis.com/youtube/v3/videos` +
        `?part=contentDetails&key=${YT_API_KEY}&id=${batch.join()}`;
      Http.open("GET", url);
      Http.send();

      Http.onreadystatechange = (e) => {
        let res = Http.responseText;
        let batchItems = JSON.parse(res.toString()).items;
        results.push(batchItems);

        batchLoaded++;

        console.log(`Batch loaded ${batchLoaded}/${batches.length}`);
        console.log({ res, batchItems, results });

        if (batchLoaded >= batches.length) {
          loading = false;
          resetLoading();

          let resEl = document.getElementById("yt_results");

          resEl.textContent = JSON.stringify(results);
        }
      };
    }
  } catch (e) {
    console.warn(e);
    loading = false;
    resetLoading();
  }
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
