const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("submit")
      updateBtn.removeAttribute("disabled")
    });