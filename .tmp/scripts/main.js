'use strict';

/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function () {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features

  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));

  var isOneFilled = false;
  var isTwoFilled = false;

  $('.focus-one').focus(function (e) {
    $('.info').hide();
    $('#one').show();
  }).blur(function (e) {
    var val = $(e.target).val();
    isOneFilled = val === '' ? false : true;
    $('.licenceType').text(val);
    isComplete();
  });

  $('.focus-two').focus(function (e) {
    $('.info').hide();
    $('#two').show();
  }).blur(function (e) {
    var val = $(e.target).val();
    isTwoFilled = val === '' ? false : true;
    $('.licenceNumber').text(val);
    isComplete();
  });

  function isComplete() {
    if (isOneFilled && isTwoFilled) {
      console.log('complete!');
      $('.info').hide();
      $('#complete').show();
    } else {
      $('.info').hide();
    }
  }

  // Your custom JavaScript goes here
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiaXNMb2NhbGhvc3QiLCJCb29sZWFuIiwid2luZG93IiwibG9jYXRpb24iLCJob3N0bmFtZSIsIm1hdGNoIiwiaXNPbmVGaWxsZWQiLCJpc1R3b0ZpbGxlZCIsIiQiLCJmb2N1cyIsImUiLCJoaWRlIiwic2hvdyIsImJsdXIiLCJ2YWwiLCJ0YXJnZXQiLCJ0ZXh0IiwiaXNDb21wbGV0ZSIsImNvbnNvbGUiLCJsb2ciXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQTtBQUNBLENBQUMsWUFBWTtBQUNYOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQUlBLGNBQWNDLFFBQVFDLE9BQU9DLFFBQVAsQ0FBZ0JDLFFBQWhCLEtBQTZCLFdBQTdCO0FBQ3hCO0FBQ0FGLFNBQU9DLFFBQVAsQ0FBZ0JDLFFBQWhCLEtBQTZCLE9BRkw7QUFHeEI7QUFDQUYsU0FBT0MsUUFBUCxDQUFnQkMsUUFBaEIsQ0FBeUJDLEtBQXpCLENBQ0Usd0RBREYsQ0FKZ0IsQ0FBbEI7O0FBU0EsTUFBSUMsY0FBYyxLQUFsQjtBQUNBLE1BQUlDLGNBQWMsS0FBbEI7O0FBRUFDLElBQUUsWUFBRixFQUFnQkMsS0FBaEIsQ0FBc0IsVUFBVUMsQ0FBVixFQUFhO0FBQ2pDRixNQUFFLE9BQUYsRUFBV0csSUFBWDtBQUNBSCxNQUFFLE1BQUYsRUFBVUksSUFBVjtBQUNELEdBSEQsRUFHR0MsSUFISCxDQUdRLFVBQVVILENBQVYsRUFBYTtBQUNuQixRQUFJSSxNQUFNTixFQUFFRSxFQUFFSyxNQUFKLEVBQVlELEdBQVosRUFBVjtBQUNBUixrQkFBY1EsUUFBUSxFQUFSLEdBQWEsS0FBYixHQUFxQixJQUFuQztBQUNBTixNQUFFLGNBQUYsRUFBa0JRLElBQWxCLENBQXVCRixHQUF2QjtBQUNBRztBQUNELEdBUkQ7O0FBVUFULElBQUUsWUFBRixFQUFnQkMsS0FBaEIsQ0FBc0IsVUFBVUMsQ0FBVixFQUFhO0FBQ2pDRixNQUFFLE9BQUYsRUFBV0csSUFBWDtBQUNBSCxNQUFFLE1BQUYsRUFBVUksSUFBVjtBQUNELEdBSEQsRUFHR0MsSUFISCxDQUdRLFVBQVVILENBQVYsRUFBYTtBQUNuQixRQUFJSSxNQUFNTixFQUFFRSxFQUFFSyxNQUFKLEVBQVlELEdBQVosRUFBVjtBQUNBUCxrQkFBY08sUUFBUSxFQUFSLEdBQWEsS0FBYixHQUFxQixJQUFuQztBQUNBTixNQUFFLGdCQUFGLEVBQW9CUSxJQUFwQixDQUF5QkYsR0FBekI7QUFDQUc7QUFDQyxHQVJIOztBQVVBLFdBQVNBLFVBQVQsR0FBc0I7QUFDcEIsUUFBSVgsZUFBZUMsV0FBbkIsRUFBZ0M7QUFDOUJXLGNBQVFDLEdBQVIsQ0FBWSxXQUFaO0FBQ0FYLFFBQUUsT0FBRixFQUFXRyxJQUFYO0FBQ0FILFFBQUUsV0FBRixFQUFlSSxJQUFmO0FBQ0QsS0FKRCxNQUlPO0FBQ0xKLFFBQUUsT0FBRixFQUFXRyxJQUFYO0FBQ0Q7QUFDRjs7QUFXRDtBQUNELENBM0REIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqXG4gKiAgV2ViIFN0YXJ0ZXIgS2l0XG4gKiAgQ29weXJpZ2h0IDIwMTUgR29vZ2xlIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqICB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiAgWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgaHR0cHM6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZVxuICpcbiAqL1xuLyogZXNsaW50LWVudiBicm93c2VyICovXG4oZnVuY3Rpb24gKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gQ2hlY2sgdG8gbWFrZSBzdXJlIHNlcnZpY2Ugd29ya2VycyBhcmUgc3VwcG9ydGVkIGluIHRoZSBjdXJyZW50IGJyb3dzZXIsXG4gIC8vIGFuZCB0aGF0IHRoZSBjdXJyZW50IHBhZ2UgaXMgYWNjZXNzZWQgZnJvbSBhIHNlY3VyZSBvcmlnaW4uIFVzaW5nIGFcbiAgLy8gc2VydmljZSB3b3JrZXIgZnJvbSBhbiBpbnNlY3VyZSBvcmlnaW4gd2lsbCB0cmlnZ2VyIEpTIGNvbnNvbGUgZXJyb3JzLiBTZWVcbiAgLy8gaHR0cDovL3d3dy5jaHJvbWl1bS5vcmcvSG9tZS9jaHJvbWl1bS1zZWN1cml0eS9wcmVmZXItc2VjdXJlLW9yaWdpbnMtZm9yLXBvd2VyZnVsLW5ldy1mZWF0dXJlc1xuICB2YXIgaXNMb2NhbGhvc3QgPSBCb29sZWFuKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gJ2xvY2FsaG9zdCcgfHxcbiAgICAvLyBbOjoxXSBpcyB0aGUgSVB2NiBsb2NhbGhvc3QgYWRkcmVzcy5cbiAgICB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUgPT09ICdbOjoxXScgfHxcbiAgICAvLyAxMjcuMC4wLjEvOCBpcyBjb25zaWRlcmVkIGxvY2FsaG9zdCBmb3IgSVB2NC5cbiAgICB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWUubWF0Y2goXG4gICAgICAvXjEyNyg/OlxcLig/OjI1WzAtNV18MlswLTRdWzAtOV18WzAxXT9bMC05XVswLTldPykpezN9JC9cbiAgICApXG4gICk7XG5cbiAgdmFyIGlzT25lRmlsbGVkID0gZmFsc2U7XG4gIHZhciBpc1R3b0ZpbGxlZCA9IGZhbHNlO1xuXG4gICQoJy5mb2N1cy1vbmUnKS5mb2N1cyhmdW5jdGlvbiAoZSkge1xuICAgICQoJy5pbmZvJykuaGlkZSgpO1xuICAgICQoJyNvbmUnKS5zaG93KCk7XG4gIH0pLmJsdXIoZnVuY3Rpb24gKGUpIHtcbiAgICBsZXQgdmFsID0gJChlLnRhcmdldCkudmFsKClcbiAgICBpc09uZUZpbGxlZCA9IHZhbCA9PT0gJycgPyBmYWxzZSA6IHRydWU7IFxuICAgICQoJy5saWNlbmNlVHlwZScpLnRleHQodmFsKTtcbiAgICBpc0NvbXBsZXRlKCk7XG4gIH0pXG5cbiAgJCgnLmZvY3VzLXR3bycpLmZvY3VzKGZ1bmN0aW9uIChlKSB7XG4gICAgJCgnLmluZm8nKS5oaWRlKCk7XG4gICAgJCgnI3R3bycpLnNob3coKTtcbiAgfSkuYmx1cihmdW5jdGlvbiAoZSkge1xuICAgIGxldCB2YWwgPSAkKGUudGFyZ2V0KS52YWwoKVxuICAgIGlzVHdvRmlsbGVkID0gdmFsID09PSAnJyA/IGZhbHNlIDogdHJ1ZTtcbiAgICAkKCcubGljZW5jZU51bWJlcicpLnRleHQodmFsKTtcbiAgICBpc0NvbXBsZXRlKCk7XG4gICAgfSlcbiAgXG4gIGZ1bmN0aW9uIGlzQ29tcGxldGUoKSB7XG4gICAgaWYgKGlzT25lRmlsbGVkICYmIGlzVHdvRmlsbGVkKSB7IFxuICAgICAgY29uc29sZS5sb2coJ2NvbXBsZXRlIScpO1xuICAgICAgJCgnLmluZm8nKS5oaWRlKCk7XG4gICAgICAkKCcjY29tcGxldGUnKS5zaG93KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQoJy5pbmZvJykuaGlkZSgpO1xuICAgIH1cbiAgfVxuICBcblxuICBcblxuXG5cblxuXG5cblxuICAvLyBZb3VyIGN1c3RvbSBKYXZhU2NyaXB0IGdvZXMgaGVyZVxufSkoKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
