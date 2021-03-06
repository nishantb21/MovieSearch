function returnClass(percentage) {
    var className;
    if (percentage > 66) {
        className = "bg-success";
    }
    else if ((percentage > 33) && (percentage <= 66)) {
        className = "bg-warning";
    }
    else {
        className = "bg-danger";
    }

    return className;
}

function openModalAndLog(id, title, year) {
    var data = {};
    data["imdb_ID"] = id;
    data["title"] = title;
    data["year"] = year;
    $.post('/log', data);

    openModal(id);
}

function openModal(id) {
    var modalDOMElement = document.getElementById(id);
    var myModal = new bootstrap.Modal(modalDOMElement, { keyboard: false });

    if (modalDOMElement.dataset.fetched == "false") {
        var url = "/movie/" + id;
        $.post(url, function (data) {
            var img_element = document.getElementById(id + ".img");
            img_element.src = data["Poster"];
            var plot_element = document.getElementById(id + ".plot");
            plot_element.innerHTML = data["Plot"];
            var actor_element = document.getElementById(id + ".actors");
            actor_element.innerHTML = data["Actors"];
            var producer_element = document.getElementById(id + ".producers");
            producer_element.innerHTML = data["Production"];

            var imd_element = document.getElementById(id + ".imd");
            var imd_perc = eval(data["Ratings"][0].Value) * 100;
            imd_element.style.width = imd_perc.toString() + "%";
            imd_element.className += " " + returnClass(imd_perc);

            var rot_element = document.getElementById(id + ".rot");
            var rot_perc = parseInt(data["Ratings"][1].Value.slice(0, -1));
            rot_element.style.width = rot_perc.toString() + "%";
            rot_element.className += " " + returnClass(rot_perc);

            var meta_element = document.getElementById(id + ".meta");
            var meta_perc = eval(data["Ratings"][2].Value) * 100;
            meta_element.style.width = meta_perc.toString() + "%";
            meta_element.className += " " + returnClass(meta_perc);
        });
        modalDOMElement.dataset.fetched = "true";
    }

    myModal.show();
}