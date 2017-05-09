---
title: Contact Matt Oakes — Mobile App Developer in Brighton & London
layout: layout.hbs
twitter: true
priority: 0.8
---

<div id="contact">
    <section id="introduction" class="contact-section">
        <div id="tagline">
            <p>Ready to improve your mobile presence?</p>
        </div>
        <p>If you prefer you can email directly at <a href="mailto:hello@mattoakes.net">hello@mattoakes.net.</a></p>
    </section>

    <section id="contact-form" class="contact-section">
        <form action="//formspree.io/hello@mattoakes.net" method="POST">
            <fieldset>
                <label for="name">Your name</label>
                <input type="text" name="name" required>
            </fieldset>
            <fieldset>
                <label for="email">Your email</label>
                <input type="email" name="email" required>
            </fieldset>
            <fieldset>
                <label for="_subject">Subject</label>
                <input type="text" name="_subject" required>
            </fieldset>
            <fieldset>
                <label for="message">Your message</label>
                <textarea name="message" rows="5" required></textarea>
            </fieldset>
            <input type="hidden" name="_next" value="{{ siteurl }}thanks/" />

            <input class="button submit" type="submit" value="Send">
        </form>
    </section>
</div>
