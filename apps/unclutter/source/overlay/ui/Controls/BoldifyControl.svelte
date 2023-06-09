
<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { boldFirstTwoLetters, removeBoldFirstTwoLetters, updateBoldedText } from "source/content-script/boldFirstTwoLetters";
    import { reportEventContentScript } from "@unclutter/library-components/dist/common/messaging";
    import Icon from "../Icon.svelte";

    let isBoldified: boolean = false;
    let showPopout: boolean = false;

    const fontWeight = writable(500); // Reactive variable for font weight

    function handleClick() {
      console.log("Boldify button clicked");
      isBoldified = !isBoldified;
      showPopout = isBoldified;
      if (isBoldified) {
        boldFirstTwoLetters($fontWeight); // Use $ prefix to access the value of a reactive variable
      } else {
        removeBoldFirstTwoLetters();
      }
      reportEventContentScript("toggleBoldify", { isBold: isBoldified });
    }

    function handleWeightChange(change) {
        fontWeight.update(value => {
            let updatedWeight = value + change;
            if (updatedWeight < 100) updatedWeight = 100;
            if (updatedWeight > 900) updatedWeight = 900;
            updateBoldedText(updatedWeight);
            return updatedWeight;
        });
    }

    onMount(() => {
      const closePopout = () => (showPopout = false);
      document.addEventListener("click", closePopout);
      return () => document.removeEventListener("click", closePopout);
    });
</script>

<div class="lindy-page-settings-topright-button {isBoldified ? 'is-icon-green' : ''}" on:click|stopPropagation={handleClick}>
  <Icon iconName="{isBoldified ? 'bold-green' : 'text-bold'}" />
</div>

{#if showPopout}
  <div class="popout" on:click|stopPropagation>
    <div id="lindy-fontweight-decrease" on:click={() => handleWeightChange(-100)}>
      <svg class="lindy-ui-icon" viewBox="0 0 448 512">
        <path
            fill="currentColor"
            d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"
        />
      </svg>
    </div>
    <div id="lindy-fontweight-increase" on:click={() => handleWeightChange(100)}>
      <svg class="lindy-ui-icon" viewBox="0 0 448 512">
        <path
            fill="currentColor"
            d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"
        />
      </svg>
    </div>
  </div>
{/if}

<style global lang="postcss">
    .lindy-page-settings-topright-button {
      padding: 2px 8px;
      display: flex;
      align-items: center;
      width: auto;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-color);
      cursor: pointer;
      border: none;
      border-radius: 5px;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
      background-color: #f3f4f6;
      user-select: none;
      transform: scale(100%);
      filter: brightness(100%);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  
    .lindy-page-settings-topright-button:hover {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      filter: brightness(95%);
    }
  
    .is-icon-green .lindy-icon {
      color: green;
    }
  
    .lindy-page-settings-topright-text {
      margin-left: 8px;
    }
    .popout {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 5px;
    }
  .lindy-ui-icon {
    width: 24px;
    height: 24px;
    cursor: pointer;
  }

  #lindy-fontweight-decrease, #lindy-fontweight-increase {
    margin: 10px;
  }
</style>
