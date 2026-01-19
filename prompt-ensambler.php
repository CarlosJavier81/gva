<?php
/**
 * Plugin Name: Ensamblador de Prompts
 * Description: Conecta con el backend en Vercel para generar prompts legales.
 * Version: 1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Función que consulta a tu API de Vercel
function gva_obtener_plantilla($etapa, $nivel) {
    $url = 'https://legal-prompts.vercel.app/api/prompts/consultar';
    
    $args = array(
        'body'        => json_encode(array('etapa' => $etapa, 'nivel' => $nivel)),
        'headers'     => array('Content-Type' => 'application/json'),
        'timeout'     => 15,
    );

    $response = wp_remote_post($url, $args);

    if (is_wp_error($response)) return "Error de conexión.";

    $data = json_decode(wp_remote_retrieve_body($response), true);
    return ($data['success']) ? $data['data'] : null;
}

// Shortcode para usar en tus páginas: [ensamblar_prompt etapa="Prelitigio" nivel="A"]
add_shortcode('ensamblar_prompt', function($atts) {
    $atts = shortcode_atts(array(
        'etapa' => 'Prelitigio',
        'nivel' => 'A',
    ), $atts);

    $plantilla = gva_obtener_plantilla($atts['etapa'], $atts['nivel']);

    if (!$plantilla) return "No se encontró la configuración para este nivel.";

    // Aquí simulamos los datos que el abogado ingresaría en un formulario (Hechos del caso)
    // En el futuro, estos vendrán de un <textarea>
    $hechos_ejemplo = "El cliente reclama el pago de una factura vencida hace 60 días...";

    // Ensamblaje final
    $prompt_final = "### TAREA\n" . $plantilla['bloqueTarea'] . "\n\n";
    $prompt_final .= "### MARCO LEGAL\n" . $plantilla['bloqueDerecho'] . "\n\n";
    $prompt_final .= "### HECHOS DEL CASO\n" . $hechos_ejemplo;

    return "<pre style='white-space: pre-wrap; background: #f4f4f4; padding: 15px; border-radius: 8px;'>" . esc_html($prompt_final) . "</pre>";
});