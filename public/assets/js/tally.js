function setUpTally() {
    tallyUl = document.getElementById("goodBoyCoinTally");

    fetch(window.location.href + "?getTally").then(body => body.json().then(res => {
        for (i in res.data) {
            res.data.sort(function(a, b) {
                return b.coins - a.coins
            });
            li = document.createElement("LI");
            li.classList.add("center");
            h3 = document.createElement("H3");
            coinCoins = "coin";
            if (res.data[i].coins != 1) coinCoins = "coins";
            h3.innerHTML = res.data[i].username.split("#")[0] + ": " + res.data[i].coins + " " + coinCoins;
            h3.style.fontSize = "15pt";

            li.appendChild(h3);
            tallyUl.appendChild(li);
        }
    }));
}