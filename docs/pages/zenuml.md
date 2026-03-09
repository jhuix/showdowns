# [[TOC]]

# ZenUML

Support rendering svg of [ZenUML](https://github.com/mermaid-js/zenuml-core).

[ZenUML](https://github.com/mermaid-js/zenuml-core). is a family of diagramming tools operated by P&D Vision Pty Ltd. It works on Atlassian Confluence, any modern browser, JetBrains Intellij IDE. It is featured as a leading diagram-as-code solution for sequence diagrams. Extra capabilities are provided on different platforms.

ZenUML language guide see [Language Guide](https://zenuml.com/docs/category/language-guide/).

ZenUML options see [ZenumlOptions](https://github.com/mermaid-js/zenuml-core/blob/main/TUTORIAL.md#configuration).

## Markdown Syntax

````
```zenuml {"align": "<align>", “options": "<ZenumlOptions>"}
<code content>
```
````

## ZenUML example

```zenuml
A B C D

A->B.method() {
  ret0_assign_rtl =C.method_long_to_give_space {
    @return C->D: ret1_annotation_ltr
    ret5_assign_ltr = B.method
    if(x) {
      ret0_assign_rtl =C.method_long_to_give_space {
        @return C->D: ret1_annotation_ltr
        ret5_assign_ltr = B.method
      }
    }
    B.method2 {
      return ret2_return_ltr
    }
  }

  return ret2_return_rtl
  @return B->A: ret4_annotation_rtl
}
```

```zenuml { "options": {"theme":"theme-woolworths"} }
// An example for a RESTful endpoint<br>
// Go to the "Cheat sheet" tab or https://docs.zenuml.com
// to find all syntax<br>
// `POST /v1/book/{id}/borrow`
BookLibService.Borrow(id) {
  User = Session.GetUser()
  if(User.isActive) {
    try {
      BookRepository.Update(id, onLoan, User)
      receipt = new Receipt(id, dueDate)
    } catch (BookNotFoundException) {
      ErrorService.onException(BookNotFoundException)
    } finally {
      Connection.close()
    }
  }
  return receipt
}
```
