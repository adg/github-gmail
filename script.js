/*
Copyright 2015 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

(function() {

	function retryIt(fn, initialDelay, maxTries) {
	  var one = function(fn, delay, triesLeft) {
	    --triesLeft;
	    if (fn() || triesLeft <= 0) {
	      return;
	    }
	    window.setTimeout(function() {
	      one(fn, delay*2, triesLeft);
	    }, delay*2);
	  };
	  window.setTimeout(function() {
	    one(fn, initialDelay*2, maxTries-1);
	  }, initialDelay);
	}

	var hashRe = /#.*\/[a-f0-9]+$/;
	var issueRe = /^https:\/\/github.com\/([A-Za-z0-9-]+\/[A-Za-z0-9-]+\/issues\/[0-9]+)/
	var pullRe = /^https:\/\/github.com\/([A-Za-z0-9-]+\/[A-Za-z0-9-]+\/pull\/[0-9]+)/

	function addBadge() {
		var hash = window.location.hash;
		if (!hashRe.exec(hash)) return;

		var ps = document.getElementsByTagName("p");
		for (var i = 0; i < ps.length; i++) {
			var as = ps[i].getElementsByTagName("a");
			for (var j = 0; j < as.length; j++) {
				var m = issueRe.exec(as[j].href);
				if (!m) {
					m = pullRe.exec(as[j].href);
				}
				if (!m) continue;

				// If a comment mentions another issue by number,
				// GitHub will make a link to that other issue.
				// We don't want those; we only want the one at the
				// bottom that says "view it on GitHub".
				if (as[j].textContent != "view it on GitHub") continue;

				console.log("match:", m[0]);

				var magic = "azg";

				var img = document.createElement("img");
				img.src = "https://github-shields.com/github/"+m[1]+".svg";
				var a = document.createElement("a");
				a.href = m[0];
				a.appendChild(img);
				var div = document.createElement("div");
				div.className = magic;
				div.appendChild(a);

				retryIt(function() {
					var ms = document.getElementsByClassName(magic);
					if (ms.length != 1) return false;
					ms[0].parentElement.insertBefore(div, ms[0]);
					return true;
				}, 500, 5);

				return; // Stop at first one.
			}
		}
	}

	window.addEventListener("hashchange", addBadge, false);
})();
