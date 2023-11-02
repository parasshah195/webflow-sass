<script lang="ts">
  import { base } from '$app/paths';
  import ChevronRight from '$lib/components/ChevronRight.svelte';
  import { onMount } from 'svelte';
  import { addListener } from '@finsweet/ts-utils';

  onMount(() => {
    // Fetch all the details element.
    const detailsList = document.querySelectorAll('details');
    const eventListenersStack: Array<Function> = [];

    // Add the onclick listeners.
    detailsList.forEach((detailsEl) => {
      const removeListener = addListener(detailsEl, 'toggle', toggleAllDetails);
      eventListenersStack.push(removeListener);
    });

    function toggleAllDetails(ev: Event) {
      const currentDetailsEl = ev.target as HTMLDetailsElement;
      if (!currentDetailsEl?.open) {
        return;
      }

      detailsList.forEach((detailsEl) => {
        if (detailsEl != currentDetailsEl && detailsEl.open) {
          detailsEl.open = false;
        }
      });
    }

    // on unmount
    return () => {
      eventListenersStack.forEach((removeListener) => {
        removeListener();
      });
    };
  });
</script>

<div class="page-title">App Info</div>

<div class="page-content">
  <!-- Intro & Demo -->
  <details class="accordion_item">
    <summary class="accordion_title">
      App Intro & Demo
      <div class="accordion_icon">
        <ChevronRight />
      </div>
    </summary>
    <div class="accordion_content-wrapper">
      <p>Hi there, thanks for giving Sass a shot!</p>
      <p>
        It's built to make the CSS writing process much more pleasant and easy. Think of it like
        having VSCode inside Webflow.
      </p>
      <a
        class="button button-default"
        href="https://www.youtube.com/watch?v=YRj2c4yg5f8&t=38"
        target="_blank">Demo video - How to use the app</a
      >
      <div class="spacer-small" />
      <p><b>Here's how it can make your life easier:</b></p>
      <ul>
        <li>
          The app brings a fully-featured code editor environment built specifically for CSS. This
          means ability to:
          <ul>
            <li>
              Get autosuggestions for Webflow classnames, variables, and CSS properties. You no
              longer need to go back and forth, remember and copy paste class names
            </li>
            <li>
              Do fast editing stuff like - Code undo-redo, comment-uncomment,
              multi-line/multi-cursor editing, search and replace, etc.
            </li>
          </ul>
        </li>
      </ul>

      <p><b>You don't have to worry about security or websites breaking, because:</b></p>
      <ul>
        <li>
          There is no external server connection. Everything is processed locally, and stored within
          Webflow.
        </li>
        <li>
          There is no app lock-in. You can uninstall the app and still retain all your code. The
          site will function as-is and nothing will break.
        </li>
        <li>
          You will be able to copy your code (both .scss and minified .css) anytime even after
          uninstalling the app
        </li>
      </ul>
      <p>
        If you're running into any trouble with the app, have any feedback, or want to report bugs,
        you can contact me (Paras) from the Credits section below
      </p>
    </div>
  </details>

  <!-- Notes -->
  <details class="accordion_item">
    <summary class="accordion_title">
      Notes
      <div class="accordion_icon">
        <ChevronRight />
      </div>
    </summary>
    <div class="accordion_content-wrapper">
      <ul>
        <li>
          <b
            >Set <code>.scss</code> code element's <code>Visibility</code> to
            <code>Hidden</code></b
          > to ensure that the sass code doesn't output on the live site
        </li>
        <li>
          To use <code>Tab</code> key for traversing app elements, press <code>Escape</code> to focus
          out of the Editor
        </li>
        <li>
          This app can be used to write normal CSS too. Enjoy the code IDE benefits to write and
          test your custom CSS faster
        </li>
        <li>
          Unsaved code:
          <ul>
            <li>will not be lost when navigating pages (like this one) inside the page</li>
            <li>will be lost on closing the app</li>
          </ul>
        </li>
        <li>The compiled CSS is outputted in a minified format on the frontend</li>
        <li>
          To use keyboard in Webflow navigator when this app is open, click anywhere on canvas to
          take focus away from the app window.
        </li>
        <li>
          This app or its developer does not provide any support for CSS/Sass code that you may
          write here
        </li>
      </ul>
    </div>
  </details>

  <!-- Error Descriptions -->
  <details class="accordion_item">
    <summary class="accordion_title">
      Error Descriptions
      <div class="accordion_icon">
        <ChevronRight />
      </div>
    </summary>
    <div class="accordion_content-wrapper">
      <ul>
        <li>
          <p>
            <b>"Unable to locate current <code>.scss</code> element"</b> - This happens when either:
          </p>
          <ul>
            <li>
              The <code>.scss</code> element is not currently visible in the navigator - In this
              case, navigate to inside/outside a component where the <code>.scss</code> file
              resides.
              <b
                >If you see the current <code>.scss</code> in the navigator, the app should be able to
                update it.</b
              >
            </li>
            <li>
              The <code>.scss</code> element has been deleted - In this case, copy the code and start
              a new file
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </details>

  <!-- Credits -->
  <details class="accordion_item">
    <summary class="accordion_title">
      Credits
      <div class="accordion_icon">
        <ChevronRight />
      </div>
    </summary>
    <div class="accordion_content-wrapper">
      <div class="note">
        <div class="note-title">App by Paras Shah</div>
        <div class="note-links-wrapper">
          <a href="https://paras.sh" target="_blank" class="has-arrow">About <ChevronRight /></a>
          <a
            href="mailto:hey@paras.sh?subject=Webflow Sass app inquiry - "
            target="_blank"
            class="has-arrow"
          >
            Contact <ChevronRight />
          </a>
        </div>
      </div>

      <div class="note">
        <div class="note-title">Sass compiler - Dart Sass</div>
        <div class="note-links-wrapper">
          <a href="https://sass-lang.com/" target="_blank" class="has-arrow">
            About <ChevronRight />
          </a>
          <a href="{base}/info/licenses/dart-sass" class="has-arrow">
            License <ChevronRight />
          </a>
        </div>
      </div>

      <div class="note">
        <div class="note-title">Code Editor - CodeMirror</div>
        <div class="note-links-wrapper">
          <a href="https://codemirror.net/" target="_blank" class="has-arrow">
            About <ChevronRight />
          </a>
          <a href="{base}/info/licenses/codemirror" class="has-arrow">
            License <ChevronRight />
          </a>
        </div>
      </div>
    </div>
  </details>
</div>
