angular.module("rowinApp")
.directive("footerDirective",function(){
    return{
        template: `    <footer class="footer">
      <div class="footer-container">
        <!-- Column 1 -->
        <div class="footer-col">
          <h2 class="footer-logo">Rowin Academy</h2>
          <p class="footer-text">
            Excellence in rowing education since 2017. Building champions on and
            off the water.
          </p>

          <div class="social-icons">
            <a href="https://www.facebook.com/rowin.eg"
              ><i class="fab fa-facebook-f"></i
            ></a>
            <a href="https://www.instagram.com/rowin.eg"
              ><i class="fab fa-instagram"></i
            ></a>
            <a href="https://wa.me/201140637023"
              ><i class="fab fa-whatsapp"></i
            ></a>
          </div>
        </div>

        <!-- Column 2 -->
        <div class="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#!/">Home</a></li>
            <li><a href="#!/services">Services</a></li>
            <li><a href="#!/events">Events</a></li>
            <li><a href="#!/bookings">Bookings</a></li>
            <li><a href="#!/about">About Us</a></li>
          </ul>
        </div>

        <!-- Column 3 -->
        <div class="footer-col">
          <h3>Our Programs</h3>
          <ul>
            <li><a href="#">Youth Development</a></li>
            <li><a href="#">Adult Recreational</a></li>
            <li><a href="#">Competitive Racing</a></li>
            <li><a href="#">Indoor Training</a></li>
          </ul>
        </div>

        <!-- Column 4 -->
        <div class="footer-col">
          <h3>Contact Us</h3>

          <div class="contact-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>122 El Nil st., Dokki, Giza</span>
          </div>

          <div class="contact-item">
            <i class="fas fa-phone"></i>
            <span>+20 11 4063 7023</span>
          </div>

          <div class="contact-item">
            <i class="fas fa-envelope"></i>
            <span>info@rowinegy.com</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        © 2026 Rowin Academy. All rights reserved.
      </div>
    </footer>`
    }
})