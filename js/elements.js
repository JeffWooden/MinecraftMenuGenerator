// Utils
    // Menu pages sorter
$(function () {
    $("#pages").sortable();
    $("#pages").disableSelection();
});

    // Auto textarea height
$("textarea").each(function () {
    this.setAttribute("style", "height:" + (this.scrollHeight) + "px;overflow-y:hidden;");
}).on("input", function () {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});