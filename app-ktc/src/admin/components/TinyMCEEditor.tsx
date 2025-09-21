/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor } from "@tinymce/tinymce-react";
import { useUploadImageForTinyMCE } from "../service/ReactQueryCloudinary";
import { message } from "antd";
import { formatTinyMCEImageUrl } from "../lib/cloudinary-utils";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const TinyMCEEditor: React.FC<TinyMCEEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = "Enter your content here...",
}) => {
  const uploadImageMutation = useUploadImageForTinyMCE();

  const handleImageUpload = (
    blobInfo: any,
    progress: (percent: number) => void
  ) => {
    return new Promise<string>((resolve, reject) => {
      const file = blobInfo.blob() as File;

      uploadImageMutation.mutate(
        { file },
        {
          onSuccess: (data) => {
            try {
              // Use utility function to format the URL properly
              const imageUrl = formatTinyMCEImageUrl(data);

              console.log("🖼️ Image uploaded successfully:", {
                originalResponse: data,
                formattedUrl: imageUrl,
              });

              resolve(imageUrl);
            } catch (error) {
              console.error("❌ Failed to format image URL:", error);
              message.error("Failed to process uploaded image");
              reject(error);
            }
          },
          onError: (error: any) => {
            console.error("❌ Image upload failed:", error);

            let errorMessage = "Failed to upload image";
            if (error?.message) {
              errorMessage = `Upload failed: ${error.message}`;
            } else if (error?.response?.data) {
              errorMessage = `Upload failed: ${JSON.stringify(
                error.response.data
              )}`;
            }

            message.error(errorMessage);
            reject(error);
          },
        }
      );

      // Simulate progress for better UX
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 10;
        progress(progressValue);
        if (progressValue >= 90) {
          clearInterval(interval);
        }
      }, 100);
    });
  };

  return (
    <Editor
      apiKey="wbl2k4pwfg7l57bxvxpstn64o75vux3l483f2qjkhlqyl4x3"
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: "file edit view insert format tools table help",
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "help",
          "wordcount",
          "paste",
          "textcolor",
          "colorpicker",
          "hr",
          "pagebreak",
          "nonbreaking",
          "template",
          "textpattern",
          "codesample",
          "toc",
          "importcss",
        ],
        toolbar1:
          "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
          "forecolor backcolor | alignleft aligncenter alignright alignjustify",
        toolbar2:
          "bullist numlist outdent indent | link image media table | " +
          "codesample hr pagebreak | removeformat code fullscreen | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; line-height: 1.6; margin: 1rem; }",
        placeholder,
        automatic_uploads: true,
        file_picker_types: "image",
        images_upload_handler: handleImageUpload,
        paste_data_images: true,
        image_advtab: true,
        image_caption: true,
        image_dimensions: false,
        image_title: true,
        image_description: true,

        // Enhanced features with API key
        toolbar_mode: "sliding",
        contextmenu: "link image table",
        quickbars_selection_toolbar: "bold italic | quicklink h2 h3 blockquote",
        quickbars_insert_toolbar: "quickimage quicktable",

        // Font options
        font_family_formats:
          "Andale Mono=andale mono,times; Arial=arial,helvetica,sans-serif; Arial Black=arial black,avant garde; Book Antiqua=book antiqua,palatino; Comic Sans MS=comic sans ms,sans-serif; Courier New=courier new,courier; Georgia=georgia,palatino; Helvetica=helvetica; Impact=impact,chicago; Symbol=symbol; Tahoma=tahoma,arial,helvetica,sans-serif; Terminal=terminal,monaco; Times New Roman=times new roman,times; Trebuchet MS=trebuchet ms,geneva; Verdana=verdana,geneva; Webdings=webdings; Wingdings=wingdings,zapf dingbats",
        font_size_formats: "8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt",

        // Code sample settings
        codesample_languages: [
          { text: "HTML/XML", value: "markup" },
          { text: "JavaScript", value: "javascript" },
          { text: "TypeScript", value: "typescript" },
          { text: "CSS", value: "css" },
          { text: "PHP", value: "php" },
          { text: "Python", value: "python" },
          { text: "Java", value: "java" },
          { text: "C#", value: "csharp" },
          { text: "C++", value: "cpp" },
        ],

        // Table settings
        table_default_attributes: {
          border: "0",
        },
        table_default_styles: {
          "border-collapse": "collapse",
          width: "100%",
        },

        // Import CSS
        content_css: [
          "//fonts.googleapis.com/css?family=Lato:300,300i,400,400i",
          "//www.tiny.cloud/css/codepen.min.css",
        ],

        setup: (editor: any) => {
          editor.on("init", () => {
            editor.getContainer().style.transition =
              "border-color 0.15s ease-in-out";
          });

          // Custom button for quick content insertion
          editor.ui.registry.addButton("customInsertButton", {
            text: "Insert Template",
            onAction: () => {
              editor.insertContent(
                "<h2>New Section</h2><p>Your content here...</p>"
              );
            },
          });
        },
      }}
    />
  );
};

export default TinyMCEEditor;
