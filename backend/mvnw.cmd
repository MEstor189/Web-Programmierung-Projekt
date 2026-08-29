@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Startup Batch Script for Windows
@REM ----------------------------------------------------------------------------
@IF "%DEBUG%" == "" @ECHO OFF
@SETLOCAL

@SET ERROR_CODE=0

@SET MAVEN_PROJECTBASEDIR=%~dp0
@IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

@IF EXIST "%WRAPPER_JAR%" GOTO runJar

@ECHO Cannot find %WRAPPER_JAR%
@SET ERROR_CODE=1
@GOTO end

:runJar
@SET JAVA_EXE=java.exe
@IF NOT "%JAVA_HOME%"=="" SET JAVA_EXE="%JAVA_HOME%\bin\java.exe"

%JAVA_EXE% -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" -cp %WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
@IF ERRORLEVEL 1 SET ERROR_CODE=1
@GOTO end

:end
@EXIT /B %ERROR_CODE%
