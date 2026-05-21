# ebpython-builder

runoneall/ebpython 的 github 工作流步骤

## 示例代码

该仓库包含一个示例代码，用于指示如何使用 ebpython-builder 构建多架构跨平台发行版

在 `.ebpython-builder` 目录中，存放了一系列的构建配置，工作流步骤会自动读取该目录下的所有以 `.json` 结尾的文件，并作为配置文件传递给 `ebpython`

在 `src` 目录中，存放了所有项目代码，当然，在这个示例项目中，只有 `app.py`，该文件会被 `launcher` 启动，需要作为整个项目的入口点文件
