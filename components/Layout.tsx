export default ({ children }) => (
  <main>
    {children}
    <style jsx global>{`
      * {
        font-family: Menlo, Monaco, 'Lucida Console', 'Liberation Mono',
          'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New',
          monospace, serif;
      }
      body {
        background:#FC2E53;
        margin: 0;
      }
      a {
        color: #22bad9;
      }
      p {
        font-size: 14px;
        line-height: 24px;
      }
      article {
        margin: 0 auto;
        max-width: 650px;
      }
      button {
        align-items: center;
        background-color: #22bad9;
        border: 0;
        color: white;
        display: flex;
        padding: 5px 7px;
        transition: background-color 0.3s;
      }
      button:active {
        background-color: #1b9db7;
      }
      button:disabled {
        background-color: gray;
        background: gray;
      }
      button:focus {
        outline: none;
      }

      .modal-content {
        border: solid 5px black;
        border-radius:30px;
      }


    `}</style>
  </main>
)
