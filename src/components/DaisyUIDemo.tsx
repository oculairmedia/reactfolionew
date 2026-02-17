import React from 'react';

/**
 * DaisyUI Demo Component
 *
 * This component showcases daisyUI 5 components with the brutalist theme.
 * Use this as a reference for migrating Bootstrap components to daisyUI.
 */
export const DaisyUIDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight">
          daisyUI Component Demo
        </h1>
        <p className="text-base-content/70 mt-2">
          Brutalist theme with sharp corners and high contrast
        </p>
      </div>

      {/* Buttons Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn">Default</button>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn btn-neutral">Neutral</button>
          <button className="btn btn-ghost">Ghost</button>
          <button className="btn btn-link">Link</button>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="btn btn-outline">Outline</button>
          <button className="btn btn-outline btn-primary">Primary Outline</button>
          <button className="btn btn-dash">Dash</button>
          <button className="btn btn-soft btn-primary">Soft</button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button className="btn btn-xs">Tiny</button>
          <button className="btn btn-sm">Small</button>
          <button className="btn btn-md">Medium</button>
          <button className="btn btn-lg">Large</button>
          <button className="btn btn-xl">XL</button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Card */}
          <div className="card card-border bg-base-200">
            <div className="card-body">
              <h3 className="card-title">Basic Card</h3>
              <p>A simple card with brutalist styling - sharp corners, bold borders.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary">Action</button>
              </div>
            </div>
          </div>

          {/* Card with Image */}
          <div className="card card-border bg-base-200">
            <figure>
              <img
                src="https://picsum.photos/400/200"
                alt="Sample"
                className="w-full h-48 object-cover"
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title">With Image</h3>
              <p>Cards can include images above the content.</p>
            </div>
          </div>

          {/* Compact Card */}
          <div className="card card-border card-sm bg-base-200">
            <div className="card-body">
              <h3 className="card-title text-lg">Compact Card</h3>
              <p className="text-sm">Using card-sm for tighter spacing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Badges
        </h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge">Default</span>
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-secondary">Secondary</span>
          <span className="badge badge-accent">Accent</span>
          <span className="badge badge-ghost">Ghost</span>
          <span className="badge badge-info">Info</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-warning">Warning</span>
          <span className="badge badge-error">Error</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-outline badge-xs">XS</span>
          <span className="badge badge-outline badge-sm">SM</span>
          <span className="badge badge-outline badge-md">MD</span>
          <span className="badge badge-outline badge-lg">LG</span>
          <span className="badge badge-outline badge-xl">XL</span>
        </div>
      </section>

      {/* Alerts Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Alerts
        </h2>
        <div className="space-y-2">
          <div role="alert" className="alert">
            <span>Default alert — neutral information message.</span>
          </div>
          <div role="alert" className="alert alert-info">
            <span>Info alert — for helpful information.</span>
          </div>
          <div role="alert" className="alert alert-success">
            <span>Success alert — operation completed successfully.</span>
          </div>
          <div role="alert" className="alert alert-warning">
            <span>Warning alert — requires attention.</span>
          </div>
          <div role="alert" className="alert alert-error">
            <span>Error alert — something went wrong.</span>
          </div>
        </div>
      </section>

      {/* Form Elements Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Form Elements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text Input */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Text Input</legend>
            <input
              type="text"
              placeholder="Type something..."
              className="input w-full"
            />
            <p className="label">Helper text goes here</p>
          </fieldset>

          {/* Select */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Select</legend>
            <select className="select w-full">
              <option disabled selected>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </fieldset>

          {/* Textarea */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Textarea</legend>
            <textarea
              className="textarea w-full"
              placeholder="Write your message..."
              rows={3}
            />
          </fieldset>

          {/* Checkbox & Radio */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Checkboxes & Radios</legend>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="checkbox" />
                <span>Checkbox option</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="demo-radio" className="radio" />
                <span>Radio option 1</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="demo-radio" className="radio" />
                <span>Radio option 2</span>
              </label>
            </div>
          </fieldset>

          {/* Toggle */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Toggle</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="toggle" />
              <span>Enable feature</span>
            </label>
          </fieldset>

          {/* Range */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Range Slider</legend>
            <input type="range" min="0" max="100" className="range w-full" />
          </fieldset>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Tabs
        </h2>
        <div role="tablist" className="tabs tabs-box">
          <input
            type="radio"
            name="demo-tabs"
            className="tab"
            aria-label="Tab 1"
            defaultChecked
          />
          <div className="tab-content p-4">Content for Tab 1</div>

          <input
            type="radio"
            name="demo-tabs"
            className="tab"
            aria-label="Tab 2"
          />
          <div className="tab-content p-4">Content for Tab 2</div>

          <input
            type="radio"
            name="demo-tabs"
            className="tab"
            aria-label="Tab 3"
          />
          <div className="tab-content p-4">Content for Tab 3</div>
        </div>
      </section>

      {/* Modal Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Modal
        </h2>
        <button
          className="btn btn-primary"
          onClick={() =>
            (document.getElementById('demo-modal') as HTMLDialogElement)?.showModal()
          }
        >
          Open Modal
        </button>
        <dialog id="demo-modal" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg uppercase">Modal Title</h3>
            <p className="py-4">
              This is a brutalist modal with sharp corners and bold styling.
            </p>
            <div className="modal-action">
              <form method="dialog">
                <button className="btn">Close</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Loading States
        </h2>
        <div className="flex flex-wrap gap-6">
          <span className="loading loading-spinner loading-lg"></span>
          <span className="loading loading-dots loading-lg"></span>
          <span className="loading loading-ring loading-lg"></span>
          <span className="loading loading-bars loading-lg"></span>
          <span className="loading loading-infinity loading-lg"></span>
        </div>
      </section>

      {/* Progress Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Progress
        </h2>
        <div className="space-y-2">
          <progress className="progress w-full" value="25" max="100"></progress>
          <progress className="progress progress-primary w-full" value="50" max="100"></progress>
          <progress className="progress progress-secondary w-full" value="75" max="100"></progress>
          <progress className="progress progress-accent w-full" value="100" max="100"></progress>
        </div>
      </section>

      {/* Collapse/Accordion */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Accordion
        </h2>
        <div className="space-y-2">
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="demo-accordion" defaultChecked />
            <div className="collapse-title font-bold">Click to expand</div>
            <div className="collapse-content">
              <p>This is the expanded content of the first accordion item.</p>
            </div>
          </div>
          <div className="collapse collapse-arrow bg-base-200">
            <input type="radio" name="demo-accordion" />
            <div className="collapse-title font-bold">Another item</div>
            <div className="collapse-content">
              <p>This is the expanded content of the second accordion item.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Controller */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold uppercase border-b-2 border-base-content pb-2">
          Theme Controller
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme-demo"
              className="theme-controller"
              value="brutalist-dark"
              defaultChecked
            />
            <span>Dark Theme</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="theme-demo"
              className="theme-controller"
              value="brutalist-light"
            />
            <span>Light Theme</span>
          </label>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t-2 border-base-content pt-8 text-center">
        <p className="text-base-content/60">
          daisyUI 5 + Tailwind CSS 4 • Brutalist Theme
        </p>
      </div>
    </div>
  );
};

export default DaisyUIDemo;
