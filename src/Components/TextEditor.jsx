import { useEffect, useRef, useState } from "react";
import "./TextEditor.css";
import menuIcon from "/src/assets/bx-menu.svg";
// import LineIcons from "lineicons-react"
import html2canvas from "html2canvas";
// import { image } from "html2canvas/dist/types/css/types/image";
function TextEditor() {
  const [displayText, setDisplayText] = useState(null);
  const [filehandle, setFilehandle] = useState(null);
  const [recentText, setRecentText] = useState("");
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [isSideBar, setIsSideBar] = useState(true);
  const [fileName, setFileName] = useState("");
  const [parentDir, setParentDir] = useState("");
  const [directoryName, setDirectoryName] = useState("");
  // const [statusmessage, setStatusMessage] = useState("");
  const [folderName, setFolderName] = useState("");
  const [fileNameInput, setFileNameInput] = useState(null);
  // const [currentFolder, setCurrentFolder] = useState(null);
  const [currentfile, setCurrentFile] = useState(null);
  const [showRecentFiles, setShowRecentFiles] = useState([]);
  const [fileType, setFileType] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    const savedFiles = JSON.parse(localStorage.getItem("recentFiles")) || [];
    console.log(savedFiles)
    setShowRecentFiles(savedFiles);
  }, []);

  useEffect(() => {
    localStorage.setItem("recentFiles", JSON.stringify(showRecentFiles));
  }, [showRecentFiles]);

  const preRef = useRef(null);

  function handleFolderNameInput(e) {
    setFolderName(e.target.value);
  }
  function handleFileNameInput(e) {
    setFileNameInput(e.target.value);
  }
  async function filePicker() {
    try {
        const [pickFile] = await window.showOpenFilePicker();
        setFilehandle(pickFile);
        const file = await pickFile.getFile();
        const showFileName = file.name;
        setFileName(showFileName);
        setFileType(file.type);

      if (file.type.startsWith("text/")) {
        const text = await file.text();
        setDisplayText(text);
        setFileUrl("");
        // const recentFiles = [...showRecentFiles,{name:showFileName, handle: text}];
        addRecentFiles(pickFile, text, file.type)
      } else if (file.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(file);
        setFileUrl(imageUrl);
        setDisplayText("");
        // const recentFiles = [...showRecentFiles,{name:showFileName, handle: imageUrl}];
        addRecentFiles(pickFile,imageUrl, file.type)
      } else if (file.type.startsWith("video/")) {
        const videoUrl = URL.createObjectURL(file);
        setFileUrl(videoUrl);
        setDisplayText("");
        // const recentFiles = [...showRecentFiles,{name:showFileName, handle: videoUrl}];
        addRecentFiles(pickFile, videoUrl, file.type);
      } else {
        setDisplayText("unsupprted file type");
        setFileUrl("");
      }

    } catch (error) {
      console.error(`error opening file`, error);
    }
  }
  async function pickDirectory() {
    try {
      const handleDirectory = await window.showDirectoryPicker();
      setParentDir(handleDirectory);
      // setCurrentFolder(handleDirectory);
      setDirectoryName(handleDirectory.name);
      // const dirName = await handleDirectory.name;
      // setStatusMessage(dirName);

      console.log(handleDirectory);
      return handleDirectory;
    } catch (error) {
      console.error("error loading directory", error);
    }
  }

  async function createDirectory() {
    if (!parentDir) {
      alert("please select a directory ")
      return;
    };
    if(folderName === "") {
      alert("enter folder name");
      return;
    };
    try {
      const dirName = await parentDir.getDirectoryHandle(folderName, {
        create: true,
      });
      console.log(dirName);
      // setCurrentFolder(dirName);
      // setStatusMessage(dirName.name);
      setDirectoryName(dirName.name);
    } catch (error) {
      console.error("checking if it's a function or not ", error);
    }
  }
  async function createNewFile() {
    if (!parentDir) {
      alert("please select a directory ")
      return;
    };
    if(fileName === "") {
      alert("enter file name");
      return;
    };
    try {
      const newFileName = await parentDir.getFileHandle(fileNameInput, {
        create: true,
      });
      console.log(newFileName.name);
      setFileName(newFileName.name)
      setCurrentFile(newFileName);
      const newFile_name = newFileName.name;
      // addRecentFiles(newFileName, videoUrl, file.type);
      const newRecentFiles = [
        { name: newFile_name, handle: newFileName, ...showRecentFiles },
      ];
      setShowRecentFiles(newRecentFiles.slice(0, 5));
      // setShowRecentFiles((prev) => ([{...prev,name: newFile_name, handle:newFileName}]).slice(0,5))
    } catch (error) {
      console.error("unable to create file", error);
    }
  }

  async function saveFile() {
    try {
      let updatedContent = preRef.current.textContent;
      let stream = await filehandle.createWritable();
      await stream.write(updatedContent);

      await stream.close();
      setDisplayText(updatedContent);
      setRecentText(updatedContent);
      console.log(recentText);
      alert("file saved successfully");
    } catch (error) {
      console.error("error saving file", error);
    }
  }
  async function saveAs() {
    if (preRef.current.textContent === "") {
      alert("Empty, please enter some text");
      return;
    } else {
      const showSavedFile = await window.showSaveFilePicker();
      setFilehandle(showSavedFile);
      saveFile();
    }
  }
  async function saveNewFile() {
    try {
      let updatedContent = preRef.current.textContent;

      let stream = await currentfile.createWritable();
      await stream.write(updatedContent);
      await stream.close();
      setDisplayText(updatedContent);
      setRecentText(updatedContent);
      console.log(recentText);
      alert("file saved successfully");
    } catch (error) {
      console.error("Error Saving new file", error);
    }
  }
  function addRecentFiles (handle, url, type) {
    setShowRecentFiles(prevFile => [...prevFile,{handle, content: url, type}])
  }
  function OpenRecentFiles (file){
    setFilehandle(file.handle);
    setFileType(file.type);
    if(file.type.startsWith("text/")){
      setDisplayText(file.content);
      setFileUrl("");
    }else{
      setFileUrl(file.content);
      setDisplayText("")
    }
  }
  function handleChange() {
    if (preRef.current) {
      let content = preRef.current.textContent;
      setDisplayText(content);
    }
  }

  function handleNew() {
    setDisplayText("");
    setFileName("");
    setFileUrl("");
    setFileType("")
    if (preRef.current) {
      preRef.current.textContent = "";
    }
  }
  async function cutText() {
    try {
      const pre = preRef.current;
      if (pre) {
        const selectedText = window.getSelection().toString();
        const textToCut = selectedText || pre.textContent;
        // copy to clipboard
        await navigator.clipboard.writeText(textToCut);
        setRecentText(displayText);
        // remove the text from the UI
        if (selectedText) {
          const newContent = displayText.replace(selectedText, "");
          setDisplayText(newContent);
        } else {
          // if no text is selected clear the entire content
          setDisplayText("");
        }
      }
    } catch (error) {
      console.error("error occured", error);
    }

    // alert("text copied to clipboard");
  }

  async function copyText() {
    try {
      const pre = preRef.current;
      if (pre) {
        const selectedText = window.getSelection.toString();
        const textToCut = selectedText || pre.textContent;
        await navigator.clipboard.writeText(textToCut);
        alert("text copied to clipboard");
      }
    } catch (error) {
      console.error("error copying text", error);
    }
  }

  async function pasteText() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        const newContent = displayText + clipboardText;
        setDisplayText(newContent);
        // setRecentText(recentText);
        // alert("text pasted from clipboard");
      }
    } catch (error) {
      console.error("error occured pasting text", error);
    }
  }
  function toggleWordWrap() {
    setIsWordWrapEnabled((prev) => !prev);
  }
  function handleMonoSpacing() {
    setLetterSpacing((prev) => prev + 1);
  }
  function incrementFontSize() {
    setFontSize((prev) => prev + 1);
  }

  function decrementFontSize() {
    setFontSize((prev) => (prev > 1 ? prev - 1 : 1));
  }
  const styles = {
    whiteSpace: isWordWrapEnabled ? "pre-wrap" : "pre",
    letterSpacing: `${letterSpacing}px`,
    fontSize: `${fontSize}px`,
  };

  async function capture() {
    try {
      const pre = preRef.current;
      if (pre) {
        const canvas = await html2canvas(pre, { useCORS: true }); //capture element as canvas
        const imgData = canvas.toDataURL("image/png");

        // create a link to download
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "tab_capture.png"; //name of the downloaded image file;
        link.click(); // trigger download
      }
    } catch (error) {
      console.error("failed to capture Page", error);
    }
  }
  function toggleSideBar() {
    setIsSideBar((prev) => !prev);
  }

  return (
    <div className="d-flex">
      {isSideBar ? (
        <aside className="sidebar">
          <div className=" p-3 bg-primary-subtle text-white">
            <div className="accordion accordion-flush">
              <div className="accordion-item">
                <button
                  type="button"
                  className="btn bg-primary accordion-button text-white "
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="false"
                  aria-controls="collapseOne"
                >
                  File
                </button>
                <div
                  id="collapseOne"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionExample"
                >
                  <ul className="list-group">
                    <li className="list-group-item list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          className="btn btn-primary open-file"
                          onClick={pickDirectory}
                        >
                          Select Directory
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          className="btn btn-primary open-file"
                          onClick={filePicker}
                        >
                          Open File
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={saveFile}
                        >
                          save
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={saveAs}
                        >
                          save As
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleNew}
                        >
                          Clear
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="gap-2">
                        <button
                          type="button"
                          className="btn accordion-button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseFive"
                          aria-expanded="true"
                          aria-controls="collapseFive"
                         
                        >
                          Create New
                        </button>
                        <div
                          id="collapseFive"
                          className="accordion-collapse collapse show "
                          data-bs-parent="#accordionExample"
                        >
                          <ul className="list-group">
                            <li className="list-group-item list-group-item-secondary">
                              <div className="">
                                <label htmlFor="folderName">
                                  {" "}
                                  create new folder
                                </label>
                                <input
                                  type="text"
                                  name="folderName"
                                  id="folderName"
                                  className="input-holder"
                                  onChange={handleFolderNameInput}
                                  placeholder="enter folder name"
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={createDirectory}
                                >
                                  create Folder
                                </button>
                              </div>
                              {/* <input type="text" name="fileName" id="fileName" onChange={handleFolderNameInput}/> */}
                            </li>
                            <li className="list-group-item list-group-item-secondary">
                              <div className="">
                                <label htmlFor="fileName">creat new file</label>
                                <input
                                  type="text"
                                  name="fileName"
                                  id="fileName"
                                  className="input-holder"
                                  onChange={handleFileNameInput}
                                  placeholder="enter file name"
                                />

                                <button
                                  className="btn btn-primary"
                                  onClick={createNewFile}
                                >
                                  create File
                                </button>
                              </div>
                            </li>
                            <li className="list-group-item  list-group-item-secondary">
                              <div className="d-flex">
                                <button
                                  className="btn btn-primary"
                                  onClick={saveNewFile}
                                >
                                  save New file
                                </button>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item">
                <div className="d-grid">
                  <button
                    type="button"
                    className="btn bg-primary accordion-button text-white"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseNine"
                    aria-expanded="false"
                    aria-controls="collapseNine"
                  >
                    Recent Files
                  </button>
                  <div
                    id="collapseNine"
                    className="accordion-collapse collapse show "
                    data-bs-parent="#accordionExample"
                  >
                    <ul className="list-group">
                      {showRecentFiles.map((item, index) => (
                        <li
                          key={index}
                          className="list-group-item list-group-item-action list-group-item-secondary"
                        >
                          <button
                            type="button"
                            className="btn open-file"
                            onClick={() =>
                              OpenRecentFiles(item)
                            }
                          >
                            {item.handle.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <button
                  type="button"
                  className="btn bg-primary accordion-button text-white"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="true"
                  aria-controls="collapseTwo"
                >
                  Edit
                </button>
                <div
                  id="collapseTwo"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionExample"
                >
                  <ul className="list-group">
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button type="button" className="btn" onClick={cutText}>
                          Cut
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button
                          type="button"
                          className="btn"
                          onClick={copyText}
                        >
                          Copy
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-grid">
                        <button
                          type="button"
                          data-paste="#textarea"
                          className="btn"
                          onClick={pasteText}
                        >
                          Paste
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="accordion-item">
                <button
                  type="button"
                  className="btn btn-primary accordion-button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="true"
                  aria-controls="collapseThree"
                >
                  View
                </button>
                <div
                  id="collapseThree"
                  className="accordion-collapse collapse show"
                  data-bs-parent="#accordionExample"
                >
                  <ul className="list-group">
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          type="button"
                          className="btn"
                          onClick={toggleWordWrap}
                        >
                          Word Wrap
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          type="button"
                          className="btn"
                          onClick={handleMonoSpacing}
                        >
                          Monospace Font
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-flex">
                        <button type="button" className="btn" onClick={capture}>
                          Capture Tabs
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          type="button"
                          className="btn"
                          onClick={incrementFontSize}
                        >
                          Increase Font Size
                        </button>
                      </div>
                    </li>
                    <li className="list-group-item list-group-item-action list-group-item-secondary">
                      <div className="d-flex">
                        <button
                          type="button"
                          className="btn"
                          onClick={decrementFontSize}
                        >
                          Decrease Font Size
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </aside>
      ) : null}
      <div className="text-container">
        <main className="editor-container">
          <div className="p-3 bg-primary text-white">
            <div className="d-flex flex-row mb-1">
              <div className="toggle">
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={toggleSideBar}
                >
                  <img src={menuIcon} alt="menu-icon" />
                </button>
              </div>
              <h1>Text Editor</h1>
            </div>
          </div>
          <div className="p-1 bg-primary-subtle">
            <p>
              <strong></strong>
              {`${directoryName} > ${folderName}> ${fileName}`}
            </p>
          </div>

          <div className="p-3">
            <div className="text-display">
              {fileType.startsWith("text/") ? (
                <pre
                  style={styles}
                  suppressContentEditableWarning={true}
                  contentEditable={true}
                  id="textarea"
                  ref={preRef}
                  onChange={handleChange}
                >
                  {displayText}
                </pre>
              )
            : (
                <pre
                style={styles}
                suppressContentEditableWarning={true}
                contentEditable={true}
                id="textarea"
                ref={preRef}
                onChange={handleChange}
              >
                {displayText}
              </pre>
            )}

              {fileType.startsWith("image/") && (
                <img
                  src={fileUrl}
                  alt="selected-file "
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              )}

              {fileType.startsWith("video/") && (
                <video
                  src={fileUrl}
                  controls
                  style={{ maxWidth: "100%", height: "auto" }}
                >
                  your browser do not support the video tag
                </video>
              )}
            </div>
          </div>
        </main>
        <footer className="p-3 bg-primary text-white">
          <div>About</div>
        </footer>
      </div>
    </div>
  );
}

export default TextEditor;
